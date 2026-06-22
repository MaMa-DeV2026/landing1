# 🏠 mamad dev — پورتفولیوی شخصی

> پورتفولیوی وب‌دیزاینر و توسعه‌دهنده فول‌استک با طراحی مدرن، انیمیشن‌های پیشرفته و پنل مدیریت کامل.

**[English below](#english)**

---

## 🎯 نمای کلی

این پروژه یک پورتفولیوی شخصی کامل است که شامل:

- **سایت عمومی** — صفحه‌ای جذاب با انیمیشن‌های Three.js و GSAP
- **پنل مدیریت** — برای مدیریت پروژه‌ها، مهارت‌ها و پیام‌های تماس
- **API بک‌اند** — با Express و SQLite برای ذخیره‌سازی داده‌ها

---

## ⚙️ تکنولوژی‌ها

| بخش | تکنولوژی |
|-----|----------|
| فرانت‌اند | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| بک‌اند | Node.js, Express.js |
| دیتابیس | SQLite (better-sqlite3) |
| احراز هویت | JWT (jsonwebtoken) + bcrypt |
| انیمیشن | GSAP (ScrollTrigger, TextPlugin) |
| گرافیک سه‌بعدی | Three.js r128 |
| فونت فارسی | Vazirmatn (Google Fonts) |

---

## 🚀 شروع سریع

### پیش‌نیازها

- **Node.js** نسخه ۱۶ یا بالاتر
- **npm** یا **yarn**

### نصب و اجرا

```bash
# ۱. کلون پروژه
git clone <repository-url>
cd stire

# ۲. نصب وابستگی‌ها
npm install

# ۳. اجرای سرور
npm start
```

پس از اجرا، سایت در آدرس زیر قابل مشاهده است:

```
http://localhost:3000
```

---

## 📁 ساختار پروژه

```
stire/
├── index.html          # صفحه اصلی پورتفولیو
├── main.js             # منطق سایت عمومی
├── style.css           # استایل‌های سایت عمومی
├── package.json        # وابستگی‌ها و اسکریپت‌ها
│
├── server/
│   ├── server.js       # سرور Express + API routes
│   └── database.js     # تنظیمات SQLite + seed data
│
├── admin/
│   ├── index.html      # صفحه پنل مدیریت
│   ├── admin.js        # منطق پنل مدیریت
│   └── admin.css       # استایل پنل مدیریت
│
└── start-server.bat    # اسکریپت اجرا در ویندوز
```

---

## 🌟 ویژگی‌های سایت اصلی

### Hero Section
- صحنه سه‌بعدی با Three.js (مانیتور + کیبورد + ذرات)
- انیمیشن تایپ کد روی صفحه نمایش
- انیمیشن‌های GSAP هنگام لود شدن صفحه

### بخش‌ها
- **درباره من** — معرفی با کارت کد CSS
- **مهارت‌ها** — نمایش با نوارهای پیشرفت متحرک
- **نمونه‌کارها** — کارت‌های سه‌بعدی با افکت tilt
- **تماس** — فرم با اعتبارسنجی کامل

### ویژگی‌های فنی
- ✅ کاملاً RTL با پشتیبانی فارسی
- ✅ ریسپانسیو (موبایل تا دسکتاپ)
- ✅ پشتیبانی از `prefers-reduced-motion`
- ✅ کرسر سفارشی
- ✅ نوار پیشرفت اسکرول
- ✅ دکمه بازگشت به بالا

---

## 🔐 پنل مدیریت

دسترسی:

```
http://localhost:3000/admin
```

### اطلاعات ورود پیش‌فرض

```
نام کاربری: admin
رمز عبور:    admin123
```

### امکانات پنل

| تب | قابلیت‌ها |
|----|----------|
| **پروژه‌ها** | افزودن، ویرایش، حذف نمونه‌کار |
| **مهارت‌ها** | ویرایش درصد مهارت‌ها |
| **پیام‌ها** | مشاهده، علامت‌گذاری خوانده، حذف |

---

## 📡 API Endpoints

### Public (بدون احراز هویت)

| متد | آدرس | توضیح |
|------|-------|--------|
| `GET` | `/api/portfolio` | لیست پروژه‌ها |
| `GET` | `/api/skills` | لیست مهارت‌ها |
| `POST` | `/api/contact` | ارسال فرم تماس |

### Protected (نیاز به JWT)

| متد | آدرس | توضیح |
|------|-------|--------|
| `POST` | `/api/portfolio` | افزودن پروژه |
| `PUT` | `/api/portfolio/:id` | ویرایش پروژه |
| `DELETE` | `/api/portfolio/:id` | حذف پروژه |
| `POST` | `/api/skills` | افزودن مهارت |
| `PUT` | `/api/skills/:id` | ویرایش مهارت |
| `DELETE` | `/api/skills/:id` | حذف مهارت |
| `GET` | `/api/messages` | لیست پیام‌ها |
| `PUT` | `/api/messages/:id/read` | علامت خوانده |
| `DELETE` | `/api/messages/:id` | حذف پیام |

### Auth

| متد | آدرس | توضیح |
|------|-------|--------|
| `POST` | `/api/admin/login` | ورود و دریافت توکن |
| `POST` | `/api/admin/logout` | خروج |
| `GET` | `/api/admin/verify` | بررسی اعتبار توکن |

---

## 🎨 طراحی

### پالت رنگی

| رنگ | کد | کاربرد |
|------|-----|--------|
| پس‌زمینه اصلی | `#fafaf9` | پس‌زمینه صفحه |
| پس‌زمینه فرعی | `#f5f0eb` | بخش مهارت‌ها |
| متن اصلی | `#1c1917` | متن اصلی |
| اکسنت نارنجی | `#e8590c` | دکمه‌ها، لینک‌ها |
| حاشیه | `#e7e5e4` | borders |

### فونت‌ها

- **فارسی:** Vazirmatn (Google Fonts)
- **انگلیسی:** Inter

---

## 🛠️ توسعه

### اجرا در حالت توسعه

```bash
npm run dev
```

### ساختار CSS

استایل‌ها به صورت ماژولار با کامنت‌های بخش‌بندی شده:

```css
/* ============================================================
   LOADING SCREEN
   ============================================================ */

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */

/* ============================================================
   NAVIGATION
   ============================================================ */
```

### افزودن پروژه جدید از Admin Panel

۱. وارد پنل مدیریت شوید
۲. به تب «پروژه‌ها» بروید
۳. دکمه «پروژه جدید» را بزنید
۴. اطلاعات را پر کنید و ذخیره کنید

---

## 📱 ریسپانسیویتی

| اندازه صفحه | رفتار |
|-------------|--------|
| `> 1024px` | تمام امکانات فعال، گرید دو ستونه |
| `768px - 1024px` | تبلت، گرید تک ستونه |
| `375px - 768px` | موبایل، انیمیشن‌های ساده‌تر |
| `< 375px` | موبایل کوچک |

---

## 🔧 متغیرهای محیطی (اختیاری)

```env
PORT=3000              # پورت سرور (پیش‌فرض: 3000)
JWT_SECRET=your-secret # کلید JWT (پیش‌فرض: mamad-dev-secret-key-2024)
```

---

## 📄 لایسنس

ISC

---

## 👤 نویسنده

**mamad dev** — طراح وب و توسعه‌دهنده فول‌استک

- 🌐 وب‌سایت: http://localhost:3000
- 📧 ایمیل: info@mamad.dev

---

---

# 🇬🇧 English

# mamad dev — Personal Portfolio

> A modern personal portfolio website featuring 3D graphics, smooth animations, and a complete admin panel.

## Features

- **3D Hero Section** — Three.js scene with animated code terminal
- **Smooth Animations** — GSAP-powered scroll and entrance animations
- **Admin Dashboard** — Full CRUD for projects, skills, and messages
- **REST API** — Express + SQLite backend
- **RTL Support** — Complete Persian/Farsi localization
- **Responsive** — Mobile-first design
- **Accessibility** — `prefers-reduced-motion` support

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start
```

Visit: http://localhost:3000

## Admin Panel

```
URL:     http://localhost:3000/admin
User:    admin
Pass:    admin123
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Animations | GSAP, Three.js |
| Font | Vazirmatn (Persian) |

## Project Structure

```
stire/
├── index.html           # Main portfolio page
├── main.js              # Frontend logic
├── style.css            # Main styles
├── server/
│   ├── server.js        # Express API server
│   └── database.js      # SQLite setup
└── admin/
    ├── index.html       # Admin panel
    ├── admin.js         # Admin logic
    └── admin.css        # Admin styles
```

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/portfolio` | Get all projects |
| `GET` | `/api/skills` | Get all skills |
| `POST` | `/api/contact` | Submit contact form |

### Protected (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/portfolio` | Create project |
| `PUT` | `/api/portfolio/:id` | Update project |
| `DELETE` | `/api/portfolio/:id` | Delete project |
| `GET` | `/api/messages` | Get messages |
| `PUT` | `/api/messages/:id/read` | Mark as read |
| `DELETE` | `/api/messages/:id` | Delete message |

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#fafaf9` | Main background |
| Text | `#1c1917` | Primary text |
| Accent | `#e8590c` | Buttons, links |
| Border | `#e7e5e4` | Borders |

## License

ISC
