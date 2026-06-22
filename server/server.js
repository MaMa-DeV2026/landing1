/*
 * server.js — Portfolio Backend API
 * Express + SQLite + JWT Authentication
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

// Initialize database (creates tables + seeds data)
const { dbReady, database: db, saveDatabase } = require('./database');

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mamad-dev-secret-key-2024';
const JWT_EXPIRY = '7d'; // Token valid for 7 days

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'توکن احراز هویت یافت نشد' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'توکن نامعتبر یا منقضی شده' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Invalid token, but continue without auth
    }
  }
  next();
}

// ============================================================
// API ROUTES — PORTFOLIO
// ============================================================

// GET /api/portfolio — Get all projects (public)
app.get('/api/portfolio', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM portfolio_items ORDER BY created_at DESC').all();
    // Parse tags JSON
    const parsed = projects.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('[API] GET /api/portfolio error:', err);
    res.status(500).json({ error: 'خطا در دریافت پروژه‌ها' });
  }
});

// POST /api/portfolio — Add new project (admin only)
app.post('/api/portfolio', authenticateToken, (req, res) => {
  try {
    const { title, description, tags, image_url, link } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'عنوان پروژه الزامی است' });
    }

    const id = 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    db.prepare(`
      INSERT INTO portfolio_items (id, title, description, tags, image_url, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      description?.trim() || '',
      tagsJson,
      image_url?.trim() || '',
      link?.trim() || '#'
    );

    const newProject = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
    newProject.tags = JSON.parse(newProject.tags || '[]');

    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    console.error('[API] POST /api/portfolio error:', err);
    res.status(500).json({ error: 'خطا در افزودن پروژه' });
  }
});

// PUT /api/portfolio/:id — Edit project (admin only)
app.put('/api/portfolio/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, image_url, link } = req.body;

    const existing = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'پروژه یافت نشد' });
    }

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : JSON.parse(existing.tags || '[]'));

    db.prepare(`
      UPDATE portfolio_items
      SET title = ?, description = ?, tags = ?, image_url = ?, link = ?
      WHERE id = ?
    `).run(
      title?.trim() || existing.title,
      description?.trim() || existing.description,
      tagsJson,
      image_url?.trim() || '',
      link?.trim() || '#',
      id
    );

    const updated = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
    updated.tags = JSON.parse(updated.tags || '[]');

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API] PUT /api/portfolio error:', err);
    res.status(500).json({ error: 'خطا در ویرایش پروژه' });
  }
});

// DELETE /api/portfolio/:id — Delete project (admin only)
app.delete('/api/portfolio/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'پروژه یافت نشد' });
    }

    db.prepare('DELETE FROM portfolio_items WHERE id = ?').run(id);

    res.json({ success: true, message: 'پروژه حذف شد' });
  } catch (err) {
    console.error('[API] DELETE /api/portfolio error:', err);
    res.status(500).json({ error: 'خطا در حذف پروژه' });
  }
});

// ============================================================
// API ROUTES — SKILLS
// ============================================================

// GET /api/skills — Get all skills (public)
app.get('/api/skills', (req, res) => {
  try {
    const skills = db.prepare('SELECT * FROM skills ORDER BY order_index ASC').all();
    res.json({ success: true, data: skills });
  } catch (err) {
    console.error('[API] GET /api/skills error:', err);
    res.status(500).json({ error: 'خطا در دریافت مهارت‌ها' });
  }
});

// POST /api/skills — Add skill (admin only)
app.post('/api/skills', authenticateToken, (req, res) => {
  try {
    const { name, percentage, order_index } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'نام مهارت الزامی است' });
    }

    const id = 'skill-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const percent = Math.max(0, Math.min(100, parseInt(percentage) || 0));

    // Get max order_index if not provided
    let order = order_index;
    if (order === undefined || order === null) {
      const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM skills').get();
      order = (maxOrder.max || 0) + 1;
    }

    db.prepare(`
      INSERT INTO skills (id, name, percentage, order_index)
      VALUES (?, ?, ?, ?)
    `).run(id, name.trim(), percent, order);

    const newSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);

    res.status(201).json({ success: true, data: newSkill });
  } catch (err) {
    console.error('[API] POST /api/skills error:', err);
    res.status(500).json({ error: 'خطا در افزودن مهارت' });
  }
});

// PUT /api/skills/:id — Edit skill (admin only)
app.put('/api/skills/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage, order_index } = req.body;

    const existing = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'مهارت یافت نشد' });
    }

    const percent = Math.max(0, Math.min(100, parseInt(percentage) ?? existing.percentage));

    db.prepare(`
      UPDATE skills
      SET name = ?, percentage = ?, order_index = ?
      WHERE id = ?
    `).run(
      name?.trim() || existing.name,
      percent,
      order_index !== undefined ? order_index : existing.order_index,
      id
    );

    const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API] PUT /api/skills error:', err);
    res.status(500).json({ error: 'خطا در ویرایش مهارت' });
  }
});

// DELETE /api/skills/:id — Delete skill (admin only)
app.delete('/api/skills/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'مهارت یافت نشد' });
    }

    db.prepare('DELETE FROM skills WHERE id = ?').run(id);

    res.json({ success: true, message: 'مهارت حذف شد' });
  } catch (err) {
    console.error('[API] DELETE /api/skills error:', err);
    res.status(500).json({ error: 'خطا در حذف مهارت' });
  }
});

// ============================================================
// API ROUTES — MESSAGES (Contact Form)
// ============================================================

// POST /api/contact — Submit contact form (public)
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'نام الزامی است' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'ایمیل الزامی است' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'ایمیل نامعتبر است' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'پیام الزامی است' });
    }

    db.prepare(`
      INSERT INTO messages (name, email, message)
      VALUES (?, ?, ?)
    `).run(name.trim(), email.trim(), message.trim());

    res.status(201).json({ success: true, message: 'پیام شما با موفقیت ارسال شد' });
  } catch (err) {
    console.error('[API] POST /api/contact error:', err);
    res.status(500).json({ error: 'خطا در ارسال پیام' });
  }
});

// GET /api/messages — Get all messages (admin only)
app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('[API] GET /api/messages error:', err);
    res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
  }
});

// PUT /api/messages/:id/read — Mark message as read (admin only)
app.put('/api/messages/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'پیام یافت نشد' });
    }

    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);

    res.json({ success: true, message: 'پیام به عنوان خوانده شده علامت‌گذاری شد' });
  } catch (err) {
    console.error('[API] PUT /api/messages/read error:', err);
    res.status(500).json({ error: 'خطا در بروزرسانی پیام' });
  }
});

// DELETE /api/messages/:id — Delete message (admin only)
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'پیام یافت نشد' });
    }

    db.prepare('DELETE FROM messages WHERE id = ?').run(id);

    res.json({ success: true, message: 'پیام حذف شد' });
  } catch (err) {
    console.error('[API] DELETE /api/messages error:', err);
    res.status(500).json({ error: 'خطا در حذف پیام' });
  }
});

// ============================================================
// API ROUTES — AUTH
// ============================================================

// POST /api/admin/login — Login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('[API] POST /api/admin/login error:', err);
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

// POST /api/admin/logout — Logout (client-side token removal)
app.post('/api/admin/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'با موفقیت خارج شدید' });
});

// GET /api/admin/verify — Verify token validity
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
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
  res.status(404).json({ error: 'صفحه یافت نشد' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'خطای سرور' });
});

// ============================================================
// START SERVER
// ============================================================

// Wait for database to be ready before starting server
dbReady.then(() => {
  app.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║         🎯 Portfolio Backend Started              ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║  🌐 URL:        http://localhost:${PORT}              ║`);
    console.log('║  📊 API Base:   http://localhost:' + PORT + '/api            ║');
    console.log('║  🗄️  Database:  portfolio.db (sql.js)              ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log('║  👤 Default credentials:                          ║');
    console.log('║     Username: admin                               ║');
    console.log('║     Password: admin123                            ║');
    console.log('╚═══════════════════════════════════════════════════╝');
  });
}).catch((err) => {
  console.error('[Server] Failed to initialize database:', err);
  process.exit(1);
});
