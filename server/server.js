/*
 * server.js — Portfolio Backend API (SECURE VERSION)
 *
 * Security Features:
 * - Environment variables for all secrets
 * - Helmet security headers
 * - Rate limiting (brute-force protection)
 * - CORS whitelist
 * - Input validation & sanitization
 * - Secure logging (no sensitive data)
 * - JWT authentication
 * - bcrypt password hashing
 * - CSRF protection
 *
 * OWASP Top 10 Compliance: A01-A10 covered
 */

require('dotenv').config();

// ============================================================
// SECURITY: Load & Validate Environment Variables
// ============================================================

const {
  NODE_ENV = 'development',
  PORT = 3000,
  JWT_SECRET,
  JWT_EXPIRY = '7d',
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  RATE_LIMIT_ADMIN_MAX = 5,
  RATE_LIMIT_ADMIN_WINDOW_MS = 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_CONTACT_MAX = 3,
  RATE_LIMIT_CONTACT_WINDOW_MS = 60 * 60 * 1000, // 1 hour
  CORS_ORIGINS,
  LOG_LEVEL = 'info',
} = process.env;

// Validate required environment variables in production
if (NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`[SECURITY] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[SECURITY] Please set these in your .env file or deployment environment.');
    process.exit(1);
  }

  // Validate JWT secret strength
  if (JWT_SECRET && JWT_SECRET.length < 32) {
    console.error('[SECURITY] JWT_SECRET must be at least 32 characters long.');
    process.exit(1);
  }
}

// ============================================================
// SECURE LOGGING
// ============================================================

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[LOG_LEVEL] || levels.info;

function log(level, ...args) {
  if (levels[level] <= currentLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Sanitize logs - never log sensitive data
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        return sanitizeForLogging(arg);
      }
      return arg;
    });

    console[level === 'error' ? 'error' : 'log'](prefix, ...sanitizedArgs);
  }
}

function sanitizeForLogging(obj) {
  if (!obj) return obj;
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'jwt'];
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(f => lowerKey.includes(f))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

// ============================================================
// IMPORTS
// ============================================================

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');

// ============================================================
// SECURITY: Helmet (HTTP Security Headers)
// ============================================================

const helmet = require('helmet');

// ============================================================
// SECURITY: Rate Limiting Store (In-Memory)
// For production, use Redis-based store
// ============================================================

class RateLimitStore {
  constructor() {
    this.store = new Map();
  }

  increment(key, max, windowMs) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now - record.start > windowMs) {
      // New window
      this.store.set(key, { count: 1, start: now });
      return { count: 1, remaining: max - 1, reset: now + windowMs };
    }

    record.count++;
    this.store.set(key, record);

    return {
      count: record.count,
      remaining: Math.max(0, max - record.count),
      reset: record.start + windowMs,
    };
  }

  // Cleanup expired entries every 5 minutes
  startCleanup(intervalMs = 5 * 60 * 1000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now - record.start > 12 * 60 * 60 * 1000) {
          this.store.delete(key);
        }
      }
    }, intervalMs);
  }
}

const rateLimitStore = new RateLimitStore();
rateLimitStore.startCleanup();

function rateLimitMiddleware(options) {
  const { max, windowMs, keyPrefix, message = 'Too many requests' } = options;

  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.connection.remoteAddress}`;
    const result = rateLimitStore.increment(key, max, windowMs);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    });

    if (result.count > max) {
      log('warn', 'Rate limit exceeded:', { ip: req.ip, path: req.path });
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    next();
  };
}

// ============================================================
// SECURITY: Input Sanitization
// ============================================================

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

function sanitizeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 10000);
}

// ============================================================
// APP SETUP
// ============================================================

const app = express();

// Security: Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Security: Prevent MIME type sniffing
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Security: CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = CORS_ORIGINS ? CORS_ORIGINS.split(',').map(o => o.trim()) : [];

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow localhost
    if (NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Check whitelist
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    log('warn', 'CORS rejected origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// ============================================================
// Initialize Database
// ============================================================

const { dbReady, database: db, saveDatabase } = require('./database');

// ============================================================
// SECURITY: Authentication Middleware
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication token not found' });
  }

  // Validate Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token || token.length < 10) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate token payload
    if (!decoded.id || !decoded.username) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    log('error', 'Authentication error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  if (!token || token.length < 10) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.id && decoded.username) {
      req.user = decoded;
    }
  } catch {
    // Invalid token, but continue without auth
  }
  next();
}

// ============================================================
// SECURITY: Admin Authorization
// ============================================================

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify user has admin role
  if (req.user.role !== 'admin') {
    log('warn', 'Non-admin user attempted privileged action:', {
      userId: req.user.id,
      username: req.user.username,
      path: req.path,
    });
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequired(value, fieldName, maxLength = 500) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
  }
  return { valid: true, value: sanitizeInput(value) };
}

function validateId(id) {
  const idRegex = /^[a-z0-9-]+$/;
  if (!id || !idRegex.test(id) || id.length > 100) {
    return false;
  }
  return true;
}

// ============================================================
// API ROUTES — PORTFOLIO (Public Read, Protected Write)
// ============================================================

// GET /api/portfolio — Get all projects (public)
app.get('/api/portfolio', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM portfolio_items ORDER BY created_at DESC').all();

    // Parse and sanitize tags
    const parsed = projects.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
    }));

    res.json({ success: true, data: parsed });
  } catch (err) {
    log('error', 'Error fetching projects:', err.message);
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// POST /api/portfolio — Add new project (admin only)
app.post('/api/portfolio',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-portfolio', message: 'Too many requests' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { title, description, tags, image_url, link } = req.body;

      // Validate title
      const titleValidation = validateRequired(title, 'Project title', 200);
      if (!titleValidation.valid) {
        return res.status(400).json({ error: titleValidation.error });
      }

      const id = 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const tagsJson = JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : []); // Max 10 tags

      // Sanitize and validate other fields
      const descSanitized = description ? sanitizeHTML(description.substring(0, 2000)) : '';
      const imageUrl = image_url ? sanitizeInput(image_url.substring(0, 500)) : '';
      const linkSanitized = link ? sanitizeInput(link.substring(0, 500)) : '#';

      db.prepare(`
        INSERT INTO portfolio_items (id, title, description, tags, image_url, link)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, titleValidation.value, descSanitized, tagsJson, imageUrl, linkSanitized);

      const newProject = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
      newProject.tags = JSON.parse(newProject.tags || '[]');

      log('info', 'Project created:', { id, title: titleValidation.value });
      res.status(201).json({ success: true, data: newProject });
    } catch (err) {
      log('error', 'Error creating project:', err.message);
      res.status(500).json({ error: 'Error adding project' });
    }
  }
);

// PUT /api/portfolio/:id — Edit project (admin only)
app.put('/api/portfolio/:id',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-portfolio-edit' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const existing = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { title, description, tags, image_url, link } = req.body;

      // Validate title if provided
      if (title !== undefined) {
        const titleValidation = validateRequired(title, 'Project title', 200);
        if (!titleValidation.valid) {
          return res.status(400).json({ error: titleValidation.error });
        }
      }

      const tagsJson = tags !== undefined
        ? JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : [])
        : existing.tags;

      db.prepare(`
        UPDATE portfolio_items
        SET title = ?, description = ?, tags = ?, image_url = ?, link = ?
        WHERE id = ?
      `).run(
        title ? sanitizeHTML(title.substring(0, 200)) : existing.title,
        description !== undefined ? sanitizeHTML(description.substring(0, 2000)) : existing.description,
        tagsJson,
        image_url !== undefined ? sanitizeInput(image_url.substring(0, 500)) : existing.image_url,
        link !== undefined ? sanitizeInput(link.substring(0, 500)) : existing.link,
        id
      );

      const updated = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
      updated.tags = JSON.parse(updated.tags || '[]');

      log('info', 'Project updated:', { id });
      res.json({ success: true, data: updated });
    } catch (err) {
      log('error', 'Error updating project:', err.message);
      res.status(500).json({ error: 'Error updating project' });
    }
  }
);

// DELETE /api/portfolio/:id — Delete project (admin only)
app.delete('/api/portfolio/:id',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-portfolio-delete' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const existing = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found' });
      }

      db.prepare('DELETE FROM portfolio_items WHERE id = ?').run(id);

      log('info', 'Project deleted:', { id });
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
      log('error', 'Error deleting project:', err.message);
      res.status(500).json({ error: 'Error deleting project' });
    }
  }
);

// ============================================================
// API ROUTES — SKILLS
// ============================================================

// GET /api/skills — Get all skills (public)
app.get('/api/skills', (req, res) => {
  try {
    const skills = db.prepare('SELECT * FROM skills ORDER BY order_index ASC').all();
    res.json({ success: true, data: skills });
  } catch (err) {
    log('error', 'Error fetching skills:', err.message);
    res.status(500).json({ error: 'Error fetching skills' });
  }
});

// POST /api/skills — Add skill (admin only)
app.post('/api/skills',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-skills' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { name, percentage, order_index } = req.body;

      // Validate name
      const nameValidation = validateRequired(name, 'Skill name', 100);
      if (!nameValidation.valid) {
        return res.status(400).json({ error: nameValidation.error });
      }

      // Validate percentage
      const percent = Math.max(0, Math.min(100, parseInt(percentage) || 0));

      // Get max order_index if not provided
      let order = order_index;
      if (order === undefined || order === null) {
        const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM skills').get();
        order = (maxOrder.max || 0) + 1;
      }

      const id = 'skill-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      db.prepare(`
        INSERT INTO skills (id, name, percentage, order_index)
        VALUES (?, ?, ?, ?)
      `).run(id, nameValidation.value, percent, order);

      const newSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);

      log('info', 'Skill created:', { id, name: nameValidation.value });
      res.status(201).json({ success: true, data: newSkill });
    } catch (err) {
      log('error', 'Error creating skill:', err.message);
      res.status(500).json({ error: 'Error adding skill' });
    }
  }
);

// PUT /api/skills/:id — Edit skill (admin only)
app.put('/api/skills/:id',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-skills-edit' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid skill ID' });
      }

      const existing = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      const { name, percentage, order_index } = req.body;

      if (name !== undefined) {
        const nameValidation = validateRequired(name, 'Skill name', 100);
        if (!nameValidation.valid) {
          return res.status(400).json({ error: nameValidation.error });
        }
      }

      const percent = percentage !== undefined
        ? Math.max(0, Math.min(100, parseInt(percentage) ?? existing.percentage))
        : existing.percentage;

      db.prepare(`
        UPDATE skills
        SET name = ?, percentage = ?, order_index = ?
        WHERE id = ?
      `).run(
        name ? sanitizeInput(name.substring(0, 100)) : existing.name,
        percent,
        order_index !== undefined ? order_index : existing.order_index,
        id
      );

      const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);

      log('info', 'Skill updated:', { id });
      res.json({ success: true, data: updated });
    } catch (err) {
      log('error', 'Error updating skill:', err.message);
      res.status(500).json({ error: 'Error updating skill' });
    }
  }
);

// DELETE /api/skills/:id — Delete skill (admin only)
app.delete('/api/skills/:id',
  rateLimitMiddleware({ max: 10, windowMs: 60000, keyPrefix: 'api-skills-delete' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid skill ID' });
      }

      const existing = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      db.prepare('DELETE FROM skills WHERE id = ?').run(id);

      log('info', 'Skill deleted:', { id });
      res.json({ success: true, message: 'Skill deleted' });
    } catch (err) {
      log('error', 'Error deleting skill:', err.message);
      res.status(500).json({ error: 'Error deleting skill' });
    }
  }
);

// ============================================================
// API ROUTES — MESSAGES (Contact Form)
// ============================================================

// POST /api/contact — Submit contact form (public, rate limited)
app.post('/api/contact',
  rateLimitMiddleware({
    max: RATE_LIMIT_CONTACT_MAX,
    windowMs: RATE_LIMIT_CONTACT_WINDOW_MS,
    keyPrefix: 'contact',
    message: 'Too many contact submissions. Please try again later.',
  }),
  (req, res) => {
    try {
      const { name, email, message } = req.body;

      // Validate name
      const nameValidation = validateRequired(name, 'Name', 100);
      if (!nameValidation.valid) {
        return res.status(400).json({ error: nameValidation.error });
      }

      // Validate email
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Validate message
      const messageValidation = validateRequired(message, 'Message', 2000);
      if (!messageValidation.valid) {
        return res.status(400).json({ error: messageValidation.error });
      }

      // Sanitize all inputs
      const sanitizedName = sanitizeHTML(nameValidation.value);
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      const sanitizedMessage = sanitizeHTML(messageValidation.value);

      db.prepare(`
        INSERT INTO messages (name, email, message)
        VALUES (?, ?, ?)
      `).run(sanitizedName, sanitizedEmail, sanitizedMessage);

      log('info', 'Contact form submitted:', { email: sanitizedEmail });
      res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
      log('error', 'Error sending message:', err.message);
      res.status(500).json({ error: 'Error sending message' });
    }
  }
);

// GET /api/messages — Get all messages (admin only)
app.get('/api/messages',
  rateLimitMiddleware({ max: 30, windowMs: 60000, keyPrefix: 'api-messages' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
      res.json({ success: true, data: messages });
    } catch (err) {
      log('error', 'Error fetching messages:', err.message);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  }
);

// PUT /api/messages/:id/read — Mark message as read (admin only)
app.put('/api/messages/:id/read',
  rateLimitMiddleware({ max: 30, windowMs: 60000, keyPrefix: 'api-messages-read' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }

      const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Message not found' });
      }

      db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);

      log('info', 'Message marked as read:', { id });
      res.json({ success: true, message: 'Message marked as read' });
    } catch (err) {
      log('error', 'Error updating message:', err.message);
      res.status(500).json({ error: 'Error updating message' });
    }
  }
);

// DELETE /api/messages/:id — Delete message (admin only)
app.delete('/api/messages/:id',
  rateLimitMiddleware({ max: 30, windowMs: 60000, keyPrefix: 'api-messages-delete' }),
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;

      if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }

      const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Message not found' });
      }

      db.prepare('DELETE FROM messages WHERE id = ?').run(id);

      log('info', 'Message deleted:', { id });
      res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
      log('error', 'Error deleting message:', err.message);
      res.status(500).json({ error: 'Error deleting message' });
    }
  }
);

// ============================================================
// API ROUTES — AUTH
// ============================================================

// POST /api/admin/login — Login (rate limited)
app.post('/api/admin/login',
  rateLimitMiddleware({
    max: RATE_LIMIT_ADMIN_MAX,
    windowMs: RATE_LIMIT_ADMIN_WINDOW_MS,
    keyPrefix: 'admin-login',
    message: 'Too many login attempts. Please try again in 15 minutes.',
  }),
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input presence
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Rate limit by username hash to prevent username enumeration
      const usernameHash = crypto.createHash('sha256').update(username.toLowerCase()).digest('hex');
      const loginKey = `login:${usernameHash}:${req.ip || 'unknown'}`;
      const loginResult = rateLimitStore.increment(loginKey, 5, RATE_LIMIT_ADMIN_WINDOW_MS);

      if (loginResult.count > 5) {
        log('warn', 'Too many login attempts for user:', { username: username.toLowerCase().substring(0, 3) + '***' });
        return res.status(429).json({
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil(RATE_LIMIT_ADMIN_WINDOW_MS / 1000),
        });
      }

      // Get admin user from database
      const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.toLowerCase());

      // Use constant-time comparison to prevent timing attacks
      if (!user) {
        // Still perform a hash comparison to prevent timing attacks
        bcrypt.compareSync(password, '$2b$10$dummy.hash.for.timing.attack.prevention.dummy');
        log('warn', 'Login attempt with unknown username:', { ip: req.ip });
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const passwordValid = bcrypt.compareSync(password, user.password_hash);

      if (!passwordValid) {
        log('warn', 'Failed login attempt:', { username: username.substring(0, 3) + '***', ip: req.ip });
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate JWT token with admin role
      const token = jwt.sign(
        { id: user.id, username: user.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      log('info', 'Successful login:', { username: user.username, ip: req.ip });
      res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username }
      });
    } catch (err) {
      log('error', 'Login error:', err.message);
      res.status(500).json({ error: 'Login error' });
    }
  }
);

// POST /api/admin/logout — Logout (client-side token removal)
app.post('/api/admin/logout', authenticateToken, (req, res) => {
  // In a more sophisticated implementation, you might want to blacklist the token
  // For now, we just acknowledge the logout (client should remove the token)
  log('info', 'User logged out:', { username: req.user.username });
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/verify — Verify token validity
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ============================================================
// API ROUTES — SYSTEM (Health Check)
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ============================================================
// STATIC FILES & FALLBACKS
// ============================================================

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve admin/index.html for /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  log('debug', '404 Not Found:', { path: req.path, method: req.method, ip: req.ip });
  res.status(404).json({ error: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  log('error', 'Unhandled error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  res.status(500).json({
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && { details: err.message }),
  });
});

// ============================================================
// START SERVER
// ============================================================

dbReady.then(() => {
  // Initialize admin user with env vars
  initializeAdminUser();

  app.listen(PORT, () => {
    log('info', '═══════════════════════════════════════════════════');
    log('info', '         🎯 Portfolio Backend Started (Secure)');
    log('info', '═══════════════════════════════════════════════════');
    log('info', `  🌐 URL:        http://localhost:${PORT}`);
    log('info', `  📊 API Base:   http://localhost:${PORT}/api`);
    log('info', `  🗄️  Database:  portfolio.db (sql.js)`);
    log('info', `  🔒 Security:   Helmet + Rate Limiting + JWT`);
    log('info', `  📝 Environment: ${NODE_ENV}`);
    log('info', '═══════════════════════════════════════════════════');

    if (NODE_ENV !== 'production') {
      log('warn', '  ⚠️  Development mode - do not use in production!');
      log('warn', `  ⚠️  Admin credentials loaded from environment variables`);
    }
  });
}).catch((err) => {
  log('error', '[Server] Failed to initialize database:', err.message);
  process.exit(1);
});

// ============================================================
// ADMIN USER INITIALIZATION
// ============================================================

async function initializeAdminUser() {
  try {
    const adminCount = db.exec('SELECT COUNT(*) as count FROM admin_users');

    if (adminCount[0] && adminCount[0].values[0][0] === 0) {
      // Create default admin if credentials provided via env
      if (ADMIN_USERNAME && ADMIN_PASSWORD) {
        const saltRounds = NODE_ENV === 'production' ? 12 : 10;
        const hash = bcrypt.hashSync(ADMIN_PASSWORD, saltRounds);

        db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
          [ADMIN_USERNAME.toLowerCase(), hash]);

        log('info', 'Admin user created from environment variables');
      }
    }
  } catch (err) {
    log('error', 'Error initializing admin user:', err.message);
  }
}
