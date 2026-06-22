/*
 * database.js — SQLite Database Setup
 * Uses sql.js for pure JavaScript SQLite operations (no native build required).
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// ============================================================
// Database Instance (initialized async)
// ============================================================

let db = null;
const dbPath = path.join(__dirname, 'portfolio.db');

// Export a promise that resolves when DB is ready
const dbReady = initSqlJs().then((SQL) => {
  // Try to load existing database
  let data = null;
  if (fs.existsSync(dbPath)) {
    try {
      data = fs.readFileSync(dbPath);
    } catch (e) {
      console.warn('[DB] Could not read existing database, creating new one');
    }
  }

  db = data ? new SQL.Database(data) : new SQL.Database();

  // Enable WAL mode
  db.run('PRAGMA journal_mode = WAL');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT DEFAULT '[]',
      image_url TEXT DEFAULT '',
      link TEXT DEFAULT '#',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      percentage INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial data
  seedDatabase();

  // Save database to disk
  saveDatabase();

  console.log('[DB] sql.js initialized, database ready');
  return db;
});

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// ============================================================
// Seed Data
// ============================================================

function seedDatabase() {
  // Skills
  const skillCount = db.exec('SELECT COUNT(*) as count FROM skills');
  if (skillCount[0] && skillCount[0].values[0][0] === 0) {
    const skills = [
      ['ui-ux', 'طراحی UI/UX', 92, 0],
      ['html-css', 'HTML & CSS', 95, 1],
      ['javascript', 'JavaScript', 80, 2],
      ['figma', 'Figma', 88, 3],
      ['responsive', 'طراحی ریسپانسیو', 90, 4],
      ['adobe-xd', 'Adobe XD', 75, 5],
    ];

    const stmt = db.prepare('INSERT INTO skills (id, name, percentage, order_index) VALUES (?, ?, ?, ?)');
    skills.forEach((s) => stmt.run(s));
    stmt.free();
    console.log('[DB] Skills seeded');
  }

  // Portfolio items
  const projectCount = db.exec('SELECT COUNT(*) as count FROM portfolio_items');
  if (projectCount[0] && projectCount[0].values[0][0] === 0) {
    const projects = [
      [
        'proj-1',
        'Lumina — پنل مدیریت SaaS',
        'طراحی رابط کاربری برای یک پنل تحلیل داده با قابلیت نمایش اطلاعات لحظه‌ای و پشتیبانی از حالت تاریک.',
        JSON.stringify(['Figma', 'UI/UX', 'CSS']),
        'https://cdn.dribbble.com/userupload/43111624/file/original-52851378199548dd20f80f06ed4448b3.png?format=webp&resize=1000x750&vertical=center',
        '#'
      ],
      [
        'proj-2',
        'Bloom — فروشگاه آنلاین گل',
        'طراحی تجربه کاربری کامل برای یک فروشگاه اینترنتی با رویکرد موبایل‌فرست و انیمیشن‌های روان.',
        JSON.stringify(['HTML', 'CSS', 'JavaScript']),
        'https://cdn.dribbble.com/userupload/37233954/file/original-bbded23d0654a44bcdf825cc541142ef.png?format=webp&resize=800x600&vertical=center',
        '#'
      ],
      [
        'proj-3',
        'Forge — وب‌سایت آژانس دیجیتال',
        'طراحی وب‌سایت معرفی برای یک آژانس دیجیتال با تمرکز بر تجربه اسکرول و هویت بصری قوی.',
        JSON.stringify(['Figma', 'GSAP', 'CSS']),
        'https://cdn.dribbble.com/userupload/44350275/file/6eea7358e580c7821da3b941d08bb92d.png?format=webp&resize=1000x750&vertical=center',
        '#'
      ],
      [
        'proj-4',
        'Zeno — وبلاگ شخصی',
        'طراحی وبلاگ با رویکرد محتوامحور، خوانایی بالا و سرعت بارگذاری بهینه.',
        JSON.stringify(['UI Design', 'Typography', 'CSS']),
        'https://cdn.dribbble.com/userupload/8449020/file/original-86e598825b4c6e3b77afccfc3a37247c.png?resize=2048x1536&vertical=center',
        '#'
      ],
    ];

    const stmt = db.prepare('INSERT INTO portfolio_items (id, title, description, tags, image_url, link) VALUES (?, ?, ?, ?, ?, ?)');
    projects.forEach((p) => stmt.run(p));
    stmt.free();
    console.log('[DB] Portfolio items seeded');
  }

  // Admin user (default: admin / admin123)
  const adminCount = db.exec('SELECT COUNT(*) as count FROM admin_users');
  if (adminCount[0] && adminCount[0].values[0][0] === 0) {
    const bcrypt = require('bcrypt');
    const hash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('[DB] Admin user created (admin/admin123)');
  }
}

// ============================================================
// Wrapper API — mirrors better-sqlite3 interface
// ============================================================

const database = {
  prepare(sql) {
    return {
      run(...params) {
        db.run(sql, params);
        saveDatabase();
      },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return row;
      },
      all(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }
    };
  },
  exec(sql) {
    db.run(sql);
    saveDatabase();
  }
};

// Auto-save every 30 seconds
setInterval(saveDatabase, 30000);

module.exports = { dbReady, database, saveDatabase };
