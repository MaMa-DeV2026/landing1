# 🏠 mamad_dev — پورتفولیوی شخصی

> پورتفولیوی وب‌دیزاینر و توسعه‌دهنده فول‌استک با طراحی مدرن، انیمیشن‌های پیشرفته Three.js و GSAP، و پنل مدیریت کامل.

**[English below](#english)**

---

## 🎯 نمای کلی

این پروژه یک پورتفولیوی شخصی کامل است که شامل:

- **سایت عمومی** — صفحه‌ای جذاب با انیمیشن‌های Three.js، GSAP و طراحی RTL فارسی
- **پنل مدیریت** — برای مدیریت پروژه‌ها، مهارت‌ها و پیام‌های تماس
- **API بک‌اند** — با Express و SQLite برای ذخیره‌سازی داده‌ها

---

## ⚙️ تکنولوژی‌ها

| بخش | تکنولوژی |
|-----|----------|
| فرانت‌اند | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| بک‌اند | Node.js, Express.js |
| دیتابیس | SQLite (sql.js) |
| احراز هویت | JWT (jsonwebtoken) + bcrypt |
| انیمیشن | GSAP (ScrollTrigger, TextPlugin) |
| گرافیک سه‌بعدی | Three.js r128 |
| فونت فارسی | Vazirmatn (Google Fonts) |
| فرم‌ها | Netlify Forms |

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
├── _headers            # هدرهای Netlify
├── robots.txt          # SEO robots
├── sitemap.xml         # Sitemap برای SEO
└── start-server.bat    # اسکریپت اجرا در ویندوز
```

---

## 🌟 ویژگی‌های سایت اصلی

### Hero Section — صحنه سه‌بعدی
- ✅ صحنه کامل Three.js با کامپیوتر (مانیتور + کیبورد + میز)
- ✅ انیمیشن تایپ کد روی صفحه نمایش (هکر استایل، سبز روی سیاه)
- ✅ کرسر چشمک‌زن روی صفحه ترمینال
- ✅ کلیدهای کیبورد با انیمیشن فشار (random press)
- ✅ ذرات سه‌بعدی متحرک (۲۰۰ پارتیکل)
- ✅ انیمیشن شناور (floating) روی مانیتور
- ✅ پارالاکس با حرکت موس (mouse tracking)
- ✅ نورپردازی پویا با سه نقطه‌نور (ambient + directional + accent)
- ✅ پالس صفحه نمایش (screen glow pulse)
- ✅ ریسپانسیو (Three.js غیرفعال در موبایل و prefers-reduced-motion)

### Navigation — منوی ناوبری
- ✅ منوی همبرگری با انیمیشن تبدیل به X
- ✅ منوی تمام‌صفحه با افکت blur
- ✅ GSAP stagger animation برای لینک‌های منو
- ✅ Active link highlighting با IntersectionObserver
- ✅ مخفی شدن navbar هنگام اسکرول به پایین
- ✅ Focus trap برای دسترسی‌پذیری کیبورد
- ✅ بستن منو با کلید Escape یا کلیک بیرون

### Hero Content — محتوای Hero
- ✅ تگ "طراحی حرفه‌ای وب" با نقطه متحرک
- ✅ عنوان دو خطی با انیمیشن reveal
- ✅ زیرعنوان با fade-in
- ✅ دو دکمه CTA (مشاهده نمونه کارها + درخواست مشاوره)
- ✅ انیمیشن GSAP Timeline هنگام لود
- ✅ Scroll indicator با خط متحرک
- ✅ پس‌زمینه تار با glassmorphism

### About Section — درباره من
- ✅ کارت کد CSS با syntax highlighting
- ✅ آمار: ۴+ سال تجربه | ۸ پروژه موفق | ۱۰۰٪ رضایت
- ✅ دکمه دانلود رزومه PDF
- ✅ تصویر پروفایل با hover effect (lift + rotate)
- ✅ GSAP fade-up animation

### Process Section — روش کار
- ✅ ۴ مرحله کاری: جلسه کشف → پیشنهاد → توسعه → تحویل
- ✅ کارت‌های با hover effect
- ✅ شماره مرحله با opacity پایین
- ✅ پس‌زمینه متفاوت (bg-alt)

### Testimonials Section — نظرات مشتریان
- ✅ ۳ کارت نظر با hover effect
- ✅ آیکون quote با opacity پایین
- ✅ نام و عنوان مشتری
- ✅ GSAP fade-up animation

### FAQ Section — سوالات متداول
- ✅ Accordion با تگ `<details>`
- ✅ انیمیشن چرخش + به × هنگام باز شدن
- ✅ محتوای پاسخ با border-top
- ✅ ۴ سوال متداول

### Timeline Section — مسیر یادگیری
- ✅ خط عمودی با گرادیان
- ✅ ۴ مرحله: پایه → فرانت‌اند → فریم‌ورک → بک‌اند
- ✅ نقطه‌های اکسنت‌دار
- ✅ انیمیشن GSAP

### Blog Section — وبلاگ
- ✅ ۳ کارت بلاگ
- ✅ تصاویر با aspect-ratio و zoom on hover
- ✅ تاریخ، عنوان، خلاصه و لینک
- ✅ GSAP fade-up animation
- ✅ پس‌زمینه متفاوت

### Skills Section — مهارت‌ها
- ✅ بارگذاری دینامیک از API یا داده پیش‌فرض
- ✅ گرید ۳ ستونه (۲ در تبلت، ۱ در موبایل)
- ✅ نوار پیشرفت متحرک با GSAP ScrollTrigger
- ✅ درصد مهارت با رنگ اکسنت
- ✅ Hover effect با lift و border اکسنت
- ✅ کارت‌های با سایه subtle

### Portfolio Section — نمونه کارها
- ✅ فیلتر دسته‌بندی: همه | فروشگاهی | شرکتی | لندینگ پیج
- ✅ دکمه‌های فیلتر با state فعال
- ✅ بارگذاری دینامیک از API یا داده پیش‌فرض
- ✅ کارت‌های با 3D Tilt effect (mouse tracking)
- ✅ GSAP stagger entrance animation
- ✅ Case Study: Challenge / Solution / Result
- ✅ تگ‌های پروژه با pill style
- ✅ تصویر با zoom on hover
- ✅ بنر تخفیف ۲۰٪
- ✅ GSAP fade animation هنگام فیلتر

### Contact Section — تماس
- ✅ فرم کامل با اعتبارسنجی:
  - نام (حداقل ۲ کاراکتر)
  - ایمیل (فرمت معتبر)
  - پیام (حداقل ۱۰ کاراکتر)
- ✅ خطاهای real-time روی blur
- ✅ حالت valid/invalid با border color
- ✅ ضد هرزنامه (honeypot)
- ✅ Netlify Forms integration
- ✅ ایمیل و تلفن مبهم (obfuscated) برای جلوگیری از harvester bots
- ✅ Badge ضمانت ۱۰۰٪ بازگشت وجه
- ✅ Loading state هنگام ارسال
- ✅ پیام موفقیت پس از ارسال

### Floating Elements — عناصر شناور
- ✅ دکمه شناور تلگرام با hover scale
- ✅ دکمه بازگشت به بالا (نمایش پس از ۴۰۰px اسکرول)
- ✅ نوار پیشرفت اسکرول (top bar)

### Footer — پاورقی
- ✅ لینک‌های شبکه‌های اجتماعی
- ✅ کپی‌رایت با سال فارسی

### SEO & Meta Tags
- ✅ Schema.org JSON-LD (ProfessionalService)
- ✅ Open Graph meta tags
- ✅ GA4 placeholder (آماده اتصال)
- ✅ Meta description و title
- ✅ SVG Favicon (هگزاگون اکسنت‌دار)
- ✅ Canonical URL
- ✅ robots.txt و sitemap.xml

### Accessibility — دسترسی‌پذیری
- ✅ Skip to main content link
- ✅ H1 مخفی برای screen readers
- ✅ ARIA labels روی دکمه‌ها و لینک‌ها
- ✅ Keyboard navigation کامل
- ✅ Focus trap در منوی موبایل
- ✅ prefers-reduced-motion support در همه جا
- ✅ Alt text روی تصاویر
- ✅ Semantic HTML tags

### Performance
- ✅ Lazy loading تصاویر
- ✅ Font preconnect به Google Fonts
- ✅ CSS custom properties برای theming
- ✅ Efficient GSAP animations
- ✅ WebGL با alpha transparency
- ✅ Responsive images (srcset-ready)

### Loading Screen
- ✅ Logo animation با GSAP (letter reveal)
- ✅ Progress bar
- ✅ Skip برای returning visitors (sessionStorage)
- ✅ Skip برای prefers-reduced-motion
- ✅ Fade out با opacity

---

## 🔐 پنل مدیریت

دسترسی:

```
http://localhost:3000/admin
```

### اطلاعات ورود

```
# در فایل .env تنظیم کنید:
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

> ⚠️ **امنیت:** اطلاعات ورود پیش‌فرض وجود ندارد. حتماً `.env.example` را کپی کرده و مقادیر امن وارد کنید.

### امکانات پنل

| تب | قابلیت‌ها |
|----|----------|
| **پروژه‌ها** | لیست، افزودن، ویرایش، حذف نمونه‌کار با case study |
| **مهارت‌ها** | لیست، افزودن، ویرایش، حذف با درصد |
| **پیام‌ها** | لیست، مشاهده، علامت‌خوانده، حذف |

### ویژگی‌های فنی Admin
- ✅ Tab navigation بین بخش‌ها
- ✅ JWT authentication با token persistence
- ✅ Protected routes با auth middleware
- ✅ Loading states روی همه actionها
- ✅ Toast notifications برای موفقیت/خطا
- ✅ Confirm dialog قبل از حذف
- ✅ Form validation
- ✅ Error handling کامل
- ✅ Token expiry handling
- ✅ Logout functionality

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
| پس‌زمینه فرعی | `#f5f0eb` | بخش مهارت‌ها، FAQ |
| متن اصلی | `#1c1917` | متن اصلی |
| متن خاکستری | `#78716c` | متن ثانویه |
| اکسنت نارنجی | `#e8590c` | دکمه‌ها، لینک‌ها |
| اکسنت تاریک | `#c2410c` | hover states |
| حاشیه | `#e7e5e4` | borders |

### فونت‌ها

- **فارسی:** Vazirmatn (Google Fonts) — وزن‌های 300-900
- **انگلیسی:** Inter (Google Fonts) — وزن‌های 300-700

### انیمیشن‌ها

| انیمیشن | توضیح |
|---------|--------|
| Fade Up | عناصر از پایین ظاهر می‌شوند |
| Fade Left | عناصر از چپ ظاهر می‌شوند |
| Stagger | لینک‌های منو یکی‌یکی ظاهر می‌شوند |
| Tilt | کارت‌ها با حرکت موس کج می‌شوند |
| Scroll Trigger | انیمیشن هنگام اسکرول |
| Elastic Reset | بازگشت نرم کارت‌ها به حالت اول |

---

## 🛠️ توسعه

### اجرا در حالت توسعه

```bash
npm run dev
```

### متغیرهای محیطی

```bash
# ۱. کپی فایل نمونه
cp .env.example .env

# ۲. ویرایش مقادیر
nano .env
```

**متغیرهای ضروری (Production):**
```env
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
CORS_ORIGINS=https://your-domain.com
```

**متغیرهای اختیاری:**
```env
NODE_ENV=development
PORT=3000
RATE_LIMIT_ADMIN_MAX=5
RATE_LIMIT_CONTACT_MAX=3
```

### تولید رمز عبور امن

```bash
# نصب وابستگی‌ها (بار اول)
npm install

# تولید هش رمز عبور
node server/scripts/generate-password.js "YourSecurePassword123!"

# نمایش به صورت JSON
node server/scripts/generate-password.js "pass" --json
```

---

## 📱 ریسپانسیویتی

| اندازه صفحه | رفتار |
|-------------|--------|
| `> 1280px` | دسکتاپ بزرگ، گرید کامل |
| `1024px - 1280px` | دسکتاپ استاندارد، گرید تطبیقی |
| `768px - 1024px` | تبلت، گرید تک/دو ستونه |
| `480px - 768px` | موبایل بزرگ، تمام امکانات |
| `375px - 480px` | موبایل استاندارد |
| `< 375px` | موبایل کوچک |
| `320px` | کوچکترین موبایل |

---

## 📋 لیست کامل قابلیت‌ها

### 🎨 فرانت‌اند
- [x] صحنه سه‌بعدی Three.js (کامپیوتر + کد تایپینگ + ذرات)
- [x] انیمیشن‌های GSAP (ScrollTrigger, Timeline, stagger)
- [x] 3D Tilt effect روی کارت‌های پروژه
- [x] Navigation با hamburger و full-page overlay
- [x] Loading screen با logo animation
- [x] Scroll progress bar
- [x] Back to top button
- [x] Active nav links با IntersectionObserver
- [x] Portfolio filter (دسته‌بندی پروژه‌ها)
- [x] Skills با نوار پیشرفت متحرک
- [x] FAQ accordion
- [x] Testimonials cards
- [x] Process steps
- [x] Timeline یادگیری
- [x] Blog preview section
- [x] Contact form با validation
- [x] Telegram floating button
- [x] Discount banner
- [x] Guarantee badge
- [x] Case study cards (Challenge/Solution/Result)

### 🔐 امنیت
- [x] JWT authentication
- [x] bcrypt password hashing
- [x] Honeypot anti-spam
- [x] Obfuscated contact info
- [x] Protected API routes
- [x] Input validation

### 📊 بک‌اند
- [x] Express.js REST API
- [x] SQLite database (sql.js)
- [x] CRUD operations برای همه entityها
- [x] Auto-save database
- [x] Seed data
- [x] Error handling
- [x] CORS configuration

### 🎯 پنل مدیریت
- [x] Login/Logout با JWT
- [x] Tab-based navigation
- [x] CRUD projects با case study
- [x] CRUD skills
- [x] Manage messages (view/mark as read/delete)
- [x] Toast notifications
- [x] Loading states
- [x] Token persistence

### ♿ دسترسی‌پذیری
- [x] Skip to content link
- [x] ARIA labels
- [x] Keyboard navigation
- [x] Focus trap
- [x] prefers-reduced-motion support
- [x] Semantic HTML
- [x] Alt text روی تصاویر
- [x] Screen reader only elements

### 📈 SEO
- [x] Schema.org JSON-LD
- [x] Open Graph tags
- [x] Meta description
- [x] robots.txt
- [x] sitemap.xml
- [x] SVG favicon
- [x] GA4 ready

---

## 📄 لایسنس

ISC

---

## 👤 نویسنده

**mamad dev** — طراح وب و توسعه‌دهنده فول‌استک

- 🌐 وب‌سایت: http://localhost:3000
- 📧 ایمیل: info@mamad_dev.com
- 📱 تلگرام: @mama07d

---

---

# 🇬🇧 English

# mamad dev — Personal Portfolio

> A modern personal portfolio website featuring 3D graphics, smooth GSAP animations, RTL Persian support, and a complete admin panel.

## Features

### 🎨 Frontend
- [x] Three.js 3D scene (computer + typing code + particles)
- [x] GSAP animations (ScrollTrigger, Timeline, stagger)
- [x] 3D Tilt effect on project cards
- [x] Hamburger navigation with full-page overlay
- [x] Loading screen with logo animation
- [x] Scroll progress bar
- [x] Back to top button
- [x] Active nav links with IntersectionObserver
- [x] Portfolio filter (project categories)
- [x] Skills with animated progress bars
- [x] FAQ accordion
- [x] Testimonials cards
- [x] Process steps
- [x] Learning timeline
- [x] Blog preview section
- [x] Contact form with validation
- [x] Telegram floating button
- [x] Discount & guarantee banners
- [x] Case study cards

### 🔐 Security
- [x] JWT authentication
- [x] bcrypt password hashing
- [x] Honeypot anti-spam
- [x] Obfuscated contact info
- [x] Protected API routes
- [x] Input validation

### 📊 Backend
- [x] Express.js REST API
- [x] SQLite database (sql.js)
- [x] CRUD operations for all entities
- [x] Auto-save database
- [x] Seed data
- [x] Error handling
- [x] CORS configuration

### 🎯 Admin Panel
- [x] Login/Logout with JWT
- [x] Tab-based navigation
- [x] CRUD projects with case study
- [x] CRUD skills
- [x] Manage messages (view/mark as read/delete)
- [x] Toast notifications
- [x] Loading states
- [x] Token persistence

### ♿ Accessibility
- [x] Skip to content link
- [x] ARIA labels
- [x] Keyboard navigation
- [x] Focus trap
- [x] prefers-reduced-motion support
- [x] Semantic HTML
- [x] Alt text on images
- [x] Screen reader only elements

### 📈 SEO
- [x] Schema.org JSON-LD
- [x] Open Graph tags
- [x] Meta description
- [x] robots.txt
- [x] sitemap.xml
- [x] SVG favicon
- [x] GA4 ready

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Backend | Node.js, Express.js |
| Database | SQLite (sql.js) |
| Auth | JWT + bcrypt |
| Animations | GSAP, Three.js |
| Font | Vazirmatn (Persian), Inter |

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
| `POST` | `/api/skills` | Create skill |
| `PUT` | `/api/skills/:id` | Update skill |
| `DELETE` | `/api/skills/:id` | Delete skill |
| `GET` | `/api/messages` | Get messages |
| `PUT` | `/api/messages/:id/read` | Mark as read |
| `DELETE` | `/api/messages/:id` | Delete message |

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#fafaf9` | Main background |
| Alt Background | `#f5f0eb` | Skills, FAQ, Blog |
| Text | `#1c1917` | Primary text |
| Muted | `#78716c` | Secondary text |
| Accent | `#e8590c` | Buttons, links |
| Accent Hover | `#c2410c` | Hover states |
| Border | `#e7e5e4` | Borders |

## License

ISC
