/*
 * main.js — Portfolio Main Application
 *
 * Modules:
 *   1. API integration & data fetching
 *   2. Default data fallback
 *   3. Loading screen animation (GSAP Timeline)
 *   4. Custom cursor
 *   5. Navigation (hamburger + full-page overlay + GSAP stagger)
 *   6. Three.js hero scene (floating 3D shape + particles)
 *   7. GSAP scroll animations (ScrollTrigger, TextPlugin)
 *   8. Skills rendering + animated progress bars
 *   9. Portfolio rendering + 3D tilt cards
 *  10. Contact form with API submission
 *  11. Scroll-based navbar show/hide
 *
 * Respects prefers-reduced-motion throughout.
 * RTL-compatible (dir="rtl" on <html>).
 */

(function () {
  'use strict';

  // ============================================================
  // API CONFIGURATION
  // ============================================================

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

  // ============================================================
  // API HELPERS
  // ============================================================

  async function fetchAPI(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Connection error');
      }
      return data;
    } catch (error) {
      console.warn('[API] Request failed:', error.message);
      return null;
    }
  }

  // ============================================================
  // DATA STATE
  // ============================================================

  let skillsData = [];
  let projectsData = [];

  /**
   * Default data structure — used when API fails.
   */
  const DEFAULT_SKILLS = [
    { id: 'ui-ux', name: 'UI/UX Design', percentage: 92 },
    { id: 'html-css', name: 'HTML & CSS', percentage: 95 },
    { id: 'javascript', name: 'JavaScript', percentage: 80 },
    { id: 'figma', name: 'Figma', percentage: 88 },
    { id: 'responsive', name: 'Responsive Design', percentage: 90 },
    { id: 'adobe-xd', name: 'Adobe XD', percentage: 75 },
  ];

  const DEFAULT_PROJECTS = [
    {
      id: 'proj-1',
      title: 'لومینا — پنل مدیریت SaaS',
      description: 'طراحی رابط کاربری برای یک پنل تحلیل داده با قابلیت نمایش اطلاعات لحظه‌ای و پشتیبانی از حالت تاریک.',
      tags: ['Figma', 'UI/UX', 'CSS'],
      category: 'Corporate',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&h=750&fit=crop',
      link: '#',
      challenge: 'مشتری به یک پلتفرم تحلیل داده پیچیده نیاز داشت که هم قدرتمند باشد و هم برای کاربران غیرفنی آسان باشد.',
      solution: 'طراحی داشبوردی شهودی با نمایش لحظه‌ای داده‌ها، ویجت‌های قابل تنظیم و تجربه حالت تاریک.',
      result: 'تعامل کاربر در اولین ماه پس از راه‌اندازی ۴۵٪ افزایش یافت.',
    },
    {
      id: 'proj-2',
      title: 'بلوم — فروشگاه آنلاین گل',
      description: 'طراحی تجربه کاربری کامل برای یک فروشگاه اینترنتی با رویکرد موبایل‌فرست و انیمیشن‌های روان.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      category: 'E-commerce',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      link: '#',
      challenge: 'یک گل‌فروشی به حضور آنلاینی نیاز داشت که با ظرافت برندش مطابقت داشته باشد و مدیریت آن آسان باشد.',
      solution: 'ایجاد تجربه خرید آنلاین با رویکرد موبایل‌فرست، میکرواینتراکشن‌های روان و پنل مدیریت آسان.',
      result: 'فروش آنلاین پس از راه‌اندازی وب‌سایت ۶۰٪ افزایش یافت.',
    },
    {
      id: 'proj-3',
      title: 'فورج — وب‌سایت آژانس دیجیتال',
      description: 'طراحی لندینگ پیج برای یک آژانس دیجیتال با تمرکز بر تجربه اسکرول و هویت بصری قوی.',
      tags: ['Figma', 'GSAP', 'CSS'],
      category: 'Landing Page',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1000&h=750&fit=crop',
      link: '#',
      challenge: 'یک آژانس دیجیتال می‌خواست وب‌سایتی داشته باشد که متمایز باشد و بازدیدکنندگان را به مشتری تبدیل کند.',
      solution: 'ساخت لندینگ پیج جذاب با انیمیشن‌های محرک اسکرول، تایپوگرافی برجسته و مطالعات موردی جذاب.',
      result: 'سرعت بارگذاری صفحه ۴۰٪ بهبود یافت و نرخ تبدیل دو برابر شد.',
    },
    {
      id: 'proj-4',
      title: 'زنو — وبلاگ شخصی',
      description: 'طراحی وبلاگ با رویکرد محتوامحور، خوانایی بالا و سرعت بارگذاری بهینه.',
      tags: ['UI Design', 'Typography', 'CSS'],
      category: 'Corporate',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&h=750&fit=crop',
      link: '#',
      challenge: 'یک تولیدکننده محتوا به وبلاگی نیاز داشت که خوانایی و سرعت بارگذاری را در اولویت قرار دهد.',
      solution: 'طراحی مینیمال و تایپوگرافی‌محور با تصاویر بهینه و بارگذاری تنبل.',
      result: 'میانگین زمان بارگذاری صفحه به کمتر از ۱.۵ ثانیه کاهش یافت.',
    },
  ];

  // ============================================================
  // LOAD DATA FROM API
  // ============================================================

  async function loadSkillsFromAPI() {
    const result = await fetchAPI('/api/skills');
    if (result && result.success && result.data) {
      skillsData = result.data;
    } else {
      skillsData = DEFAULT_SKILLS;
    }
  }

  async function loadProjectsFromAPI() {
    const result = await fetchAPI('/api/portfolio');
    if (result && result.success && result.data) {
      projectsData = result.data;
    } else {
      projectsData = DEFAULT_PROJECTS;
    }
  }

  async function loadAllData() {
    await Promise.all([loadSkillsFromAPI(), loadProjectsFromAPI()]);
  }


  // ============================================================
  // 3. LOADING SCREEN — GSAP Timeline (0.5s duration, skip for returning visitors)
  // ============================================================

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Check reduced motion — skip animation if user prefers it
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if returning visitor — skip loader entirely
    const isReturningVisitor = sessionStorage.getItem('mamad_dev_visited') === 'true';

    // Mark as visited
    sessionStorage.setItem('mamad_dev_visited', 'true');

    // Instant reveal for reduced-motion or returning visitors
    if (prefersReduced || isReturningVisitor) {
      gsap.set(loader, { display: 'none' });
      loader.setAttribute('aria-hidden', 'true');
      initHeroAnimations();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        loader.setAttribute('aria-hidden', 'true');
        gsap.set(loader, { display: 'none' });
        initHeroAnimations();
      },
    });

    // Animate logo letters staggered in (faster animation)
    tl.fromTo('.loader__logo-letter', {
      opacity: 0,
      y: 20,
      rotateX: -90,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'back.out(1.7)',
    })
    // Progress bar fill (faster)
    .to('.loader__bar', {
      width: '100%',
      duration: 0.3,
      ease: 'power2.inOut',
    }, '-=0.1')
    // Fade out the entire loader (0.5s total)
    .to(loader, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
    }, '+=0.1');
  }

  
  // ============================================================
  // 4. NAVIGATION — Hamburger + Overlay + GSAP Stagger
  // ============================================================

  function initNav() {
    const hamburger = document.getElementById('navHamburger');
    const overlay = document.getElementById('navOverlay');
    const navMenu = document.getElementById('navMenu');
    const linkItems = document.querySelectorAll('.nav__link-item');
    const navLinks = document.querySelectorAll('.nav__link');
    let isOpen = false;

    if (!hamburger || !overlay) return;

    /**
     * openNav — blur overlay fades in, links stagger from bottom
     */
    function openNav() {
      isOpen = true;
      hamburger.setAttribute('aria-expanded', 'true');
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('nav__overlay--open');
      document.body.style.overflow = 'hidden';

      // Keyboard focus trap — move focus to first link
      const firstLink = navMenu.querySelector('.nav__link');
      if (firstLink) firstLink.focus();

      // GSAP stagger: links animate in one by one
      gsap.fromTo(linkItems, {
        opacity: 0,
        y: 40,
        rotateX: -15,
      }, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Animate footer elements
      gsap.fromTo('.nav__menu-footer', {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.6,
      });
    }

    /**
     * closeNav — reverse animation, reset link positions
     */
    function closeNav() {
      isOpen = false;
      hamburger.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('nav__overlay--open');
      document.body.style.overflow = '';

      // Return focus to hamburger
      hamburger.focus();

      gsap.to(linkItems, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.04,
        ease: 'power2.in',
      });
    }

    hamburger.addEventListener('click', () => {
      isOpen ? closeNav() : openNav();
    });

    // Close when a nav link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (isOpen) closeNav();
      });
    });

    // Escape key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });

    // Click outside menu to close — on the overlay backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && isOpen) closeNav();
    });

    // Keyboard focus trap — keep focus within menu when open
    navMenu.addEventListener('keydown', (e) => {
      if (!isOpen) return;

      const focusableElements = navMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  // ============================================================
  // 4b. SCROLL PROGRESS BAR + BACK TO TOP + ACTIVE NAV LINKS
  // ============================================================

  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    if (!progressBar) return;

    /**
     * updateProgress — called on scroll, updates progress bar width
     * and toggles back-to-top visibility at 400px threshold.
     */
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

      // Progress bar: scaleX from 0 to 1 (RTL: transform-origin right)
      progressBar.style.transform = `scaleX(${scrollPercent})`;
      progressBar.classList.toggle('scroll-progress--active', scrollPercent > 0.01);

      // Back-to-top: show after 400px scroll
      if (backToTop) {
        backToTop.hidden = scrollTop < 400;
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    backToTop.addEventListener('click', () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /**
   * initActiveNavLinks — IntersectionObserver highlights nav links
   * based on which section is currently in the viewport.
   */
  function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksEl = document.querySelectorAll('.nav__link');
    if (!sections.length || !navLinksEl.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinksEl.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px', // trigger when section is near top
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /**
   * initSafariSmoothScroll — Safari doesn't support scroll-behavior: smooth
   * on all elements. This polyfill intercepts anchor clicks and uses
   * window.scrollTo with behavior: 'smooth' as fallback.
   */
  function initSafariSmoothScroll() {
    // Safari detection: only Safari lacks scroll-behavior support
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) return; // Other browsers handle it via CSS

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10);
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  // ============================================================
  // 5. THREE.JS HERO SCENE — 3D Computer with Hacker Terminal
  // ============================================================

  let threeScene, threeCamera, threeRenderer, threeParticles;
  let threeMonitorGroup, threeAnimatedObjects = [];
  let threeAnimFrameId = null;

  function initThreeJS() {
    // Respect reduced motion — skip 3D entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = document.getElementById('heroCanvasContainer');
    if (!container || typeof THREE === 'undefined') return;

    // ---- Scene setup ----
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
    threeCamera.position.set(0, 0.6, 6.5);
    threeCamera.lookAt(0, 0.1, 0);

    // ---- Renderer with alpha for transparency ----
    threeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setClearColor(0x000000, 0);
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(threeRenderer.domElement);

    // ---- Lighting ----
    threeScene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.55);
    mainLight.position.set(3, 5, 5);
    mainLight.castShadow = true;
    threeScene.add(mainLight);

    // Warm accent light
    const accentLight = new THREE.PointLight(0xe8590c, 0.6, 15);
    accentLight.position.set(-2, 3, 4);
    threeScene.add(accentLight);

    // Green screen glow
    const screenGlow = new THREE.PointLight(0x00ff41, 1.0, 10);
    screenGlow.position.set(0, 0.5, 2);
    threeScene.add(screenGlow);

    // ---- Build 3D Computer ----
    threeMonitorGroup = new THREE.Group();

    // === MONITOR ===
    // Body
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a, metalness: 0.12, roughness: 0.7,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.3, 0.1), bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    threeMonitorGroup.add(body);

    // Bezel (thin inner frame)
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(3.35, 2.08, 0.025),
      new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.05, roughness: 0.85 })
    );
    bezel.position.z = 0.065;
    threeMonitorGroup.add(bezel);

    // Screen — pure black
    const screenW = 3.15, screenH = 1.92;
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(screenW, screenH),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    screenMesh.position.z = 0.085;
    threeMonitorGroup.add(screenMesh);

    // === TERMINAL TEXT ON SCREEN — right-aligned, green on black ===
    const codeLines = [
      'const dev = {',
      '  name: "mamad.dev"',
      '  role: "Full-Stack"',
      '  skills: [',
      '    "React",',
      '    "Three.js",',
      '    "Node"',
      '  ],',
      '  build() {',
      '    return "🚀";',
      '  }',
      '};',
    ];

    const charW = 0.052;  // width per character
    const charH = 0.09;   // line height
    const startY = 0.78;  // top of screen
    const startZ = 0.09;  // just above screen surface
    const alignX = 1.35;  // right-align position

    // Store text segment groups for animation
    const textGroups = [];

    codeLines.forEach((line, lineIdx) => {
      const yPos = startY - lineIdx * charH * 1.2;
      const lineWidth = line.length * charW;
      const xPos = alignX - lineWidth; // right-aligned

      // Group for this line's segments
      const lineGroup = {
        startX: xPos,
        y: yPos,
        z: startZ,
        segments: [],
        delay: lineIdx * 0.35,
        visible: false,
      };

      // Break line into word segments (separated by spaces)
      let currentX = xPos;
      const words = line.split(/(\s+)/);
      words.forEach((word) => {
        if (!word) return;
        const isSpace = /^\s+$/.test(word);
        if (isSpace) {
          currentX += word.length * charW;
          return;
        }
        const segWidth = word.length * charW;
        const segGeo = new THREE.PlaneGeometry(segWidth, charH * 0.7);
        const segMat = new THREE.MeshBasicMaterial({
          color: 0x00ff41,
          transparent: true,
          opacity: 0,
        });
        const seg = new THREE.Mesh(segGeo, segMat);
        seg.position.set(currentX + segWidth / 2, yPos, startZ + 0.005);
        threeMonitorGroup.add(seg);
        lineGroup.segments.push(seg);
        currentX += segWidth;
      });

      textGroups.push(lineGroup);
    });

    // Blinking cursor — positioned after the last line
    const cursorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, charH * 0.75),
      new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0,
      })
    );
    const lastLineEndX = alignX - codeLines[codeLines.length - 1].length * charW;
    cursorMesh.position.set(
      lastLineEndX - 0.08,
      startY - (codeLines.length - 1) * charH * 1.2,
      startZ + 0.006
    );
    threeMonitorGroup.add(cursorMesh);

    // === MONITOR STAND ===
    // Neck
    const neck = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.65, 0.1),
      new THREE.MeshPhysicalMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 })
    );
    neck.position.set(0, -1.47, -0.05);
    neck.castShadow = true;
    threeMonitorGroup.add(neck);

    // Base plate
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.035, 0.55),
      new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.45, roughness: 0.55 })
    );
    basePlate.position.set(0, -1.8, 0);
    basePlate.receiveShadow = true;
    basePlate.castShadow = true;
    threeMonitorGroup.add(basePlate);

    // === KEYBOARD ===
    const kbBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.025, 0.95),
      new THREE.MeshPhysicalMaterial({ color: 0x1e1e1e, metalness: 0.08, roughness: 0.75 })
    );
    kbBase.position.set(0, -2.0, 0.65);
    kbBase.rotation.x = 0.1;
    kbBase.castShadow = true;
    kbBase.receiveShadow = true;
    threeMonitorGroup.add(kbBase);

    // Keyboard keys — placed EXACTLY on keyboard surface
    const keyboardKeys = [];
    const keyRows = [14, 13, 12, 10];
    const tiltAngle = 0.1;
    const kbTopY = -1.987; // just above keyboard base surface

    for (let row = 0; row < 4; row++) {
      const keysInRow = keyRows[row];
      const rowOffsetX = (14 - keysInRow) * 0.08 / 2;
      for (let k = 0; k < keysInRow; k++) {
        const keyMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.015, 0.11),
          new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.03, roughness: 0.85 })
        );
        const x = -1.2 + rowOffsetX + k * 0.17;
        const z = 0.3 + row * 0.17;
        // Y accounts for keyboard tilt: higher Z = slightly higher Y
        const y = kbTopY + (z - 0.3) * Math.sin(tiltAngle);
        keyMesh.position.set(x, y, z);
        keyMesh.rotation.x = tiltAngle;
        keyMesh.userData = {
          baseY: y,
          baseZ: z,
          keyPhase: Math.random() * Math.PI * 2,
        };
        threeMonitorGroup.add(keyMesh);
        keyboardKeys.push(keyMesh);
      }
    }

    // === DESK ===
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.08, 4),
      new THREE.MeshPhysicalMaterial({ color: 0x2d2520, metalness: 0.02, roughness: 0.92 })
    );
    desk.position.set(0, -2.05, 0.5);
    desk.receiveShadow = true;
    threeMonitorGroup.add(desk);

    // Position the group — shifted LEFT so hero text is visible on right
    threeMonitorGroup.position.set(-2.2, 0.35, 0);
    threeMonitorGroup.rotation.y = -0.2;
    threeScene.add(threeMonitorGroup);

    // === PARTICLES ===
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    threeParticles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0xe8590c, size: 0.018, transparent: true, opacity: 0.3, sizeAttenuation: true })
    );
    threeScene.add(threeParticles);

    // ---- Mouse parallax ----
    let mRotX = 0, mRotY = 0;
    document.addEventListener('mousemove', (e) => {
      mRotX = (e.clientY / window.innerHeight - 0.5) * 0.1;
      mRotY = (e.clientX / window.innerWidth - 0.5) * 0.1;
    });

    // ---- Animation loop ----
    const clock = new THREE.Clock();

    function animate() {
      threeAnimFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // --- Terminal typing animation — infinite loop ---
      textGroups.forEach((group) => {
        const cycleTime = 12; // total cycle duration in seconds
        const t = ((elapsed - group.delay) % cycleTime + cycleTime) % cycleTime;

        group.segments.forEach((seg) => {
          // Fade in quickly, stay visible, fade out at end of cycle
          if (t < 0.5) {
            seg.material.opacity = (t / 0.5) * 0.92;
          } else if (t > cycleTime - 1.5) {
            seg.material.opacity = ((cycleTime - t) / 1.5) * 0.92;
          } else {
            seg.material.opacity = 0.92;
          }
        });
      });

      // Cursor blink — always visible
      cursorMesh.material.opacity = Math.sin(elapsed * 2.5 * Math.PI) > 0 ? 0.9 : 0;

      // Keyboard keys — stay EXACTLY on keyboard surface
      keyboardKeys.forEach((key) => {
        const press = Math.sin(key.userData.keyPhase * 13 + elapsed * 2) > 0.95 ? 0.003 : 0;
        key.position.y = key.userData.baseY - press;
        key.position.z = key.userData.baseZ;
      });

      // Floating motion
      threeMonitorGroup.position.y = 0.35 + Math.sin(elapsed * 0.65) * 0.05;

      // Mouse parallax
      threeMonitorGroup.rotation.x += (mRotX - threeMonitorGroup.rotation.x) * 0.03;
      threeMonitorGroup.rotation.y += (-0.1 + mRotY - threeMonitorGroup.rotation.y) * 0.03;

      // Particles
      threeParticles.rotation.y += 0.00015;
      threeParticles.rotation.x += 0.00008;

      // Screen glow pulse
      screenGlow.intensity = 1.0 + Math.sin(elapsed * 1.8) * 0.25;

      threeRenderer.render(threeScene, threeCamera);
    }
    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
      threeCamera.aspect = window.innerWidth / window.innerHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * disposeThreeJS — clean up WebGL context on page unload.
   */
  function disposeThreeJS() {
    if (threeAnimFrameId) cancelAnimationFrame(threeAnimFrameId);
    if (threeRenderer) threeRenderer.dispose();
  }

  // ============================================================
  // 6. GSAP SCROLL ANIMATIONS
  // ============================================================

  function initScrollAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Instantly show all animated elements
      gsap.set('[data-gsap]', { opacity: 1, y: 0, x: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Fade-up elements
    gsap.utils.toArray('[data-gsap="fade-up"]').forEach((el) => {
      gsap.fromTo(el, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Fade-left elements
    gsap.utils.toArray('[data-gsap="fade-left"]').forEach((el) => {
      gsap.fromTo(el, {
        opacity: 0,
        x: -40,
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Navbar: hide on scroll down, show on scroll up
    const navbar = document.getElementById('navbar');
    ScrollTrigger.create({
      start: 80,
      onUpdate: (self) => {
        if (self.direction === 1 && window.scrollY > 200) {
          navbar.classList.add('nav--hidden');
        } else {
          navbar.classList.remove('nav--hidden');
        }
      },
    });
  }

  // ============================================================
  // 7. HERO TEXT ANIMATIONS (after loader)
  // ============================================================

  function initHeroAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set('.hero__tag, .hero__subtitle, .hero__actions', { opacity: 1, y: 0 });
      gsap.set('.hero__title-line', { y: 0 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Tag fades in
    tl.to('.hero__tag', {
      opacity: 1,
      y: 0,
      duration: 0.6,
    })
    // Title lines reveal with TextPlugin-style clip effect
    .fromTo('.hero__title-line', {
      y: 60,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
    }, '-=0.3')
    // Subtitle fades in
    .to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, '-=0.4')
    // Action buttons appear
    .to('.hero__actions', {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, '-=0.3');
  }

  // ============================================================
  // 8. SKILLS RENDERING + ANIMATED PROGRESS BARS
  // ============================================================

  function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;

    const skills = skillsData.length > 0 ? skillsData : DEFAULT_SKILLS;

    grid.innerHTML = skills.map((skill) => `
      <div class="skill-card" data-gsap="fade-up" data-skill-id="${skill.id}">
        <div class="skill-card__header">
          <span class="skill-card__name">${skill.name}</span>
          <span class="skill-card__percent">${skill.percentage}%</span>
        </div>
        <div class="skill-card__bar">
          <div class="skill-card__fill" data-percent="${skill.percentage}"></div>
        </div>
      </div>
    `).join('');

    // Animate progress bars on scroll using ScrollTrigger
    initSkillBars();
  }

  function initSkillBars() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.skill-card__fill').forEach((bar) => {
      const percent = bar.getAttribute('data-percent');

      if (prefersReduced) {
        // Instant fill for reduced motion
        gsap.set(bar, { width: percent + '%' });
        return;
      }

      // GSAP ScrollTrigger: animate width when card enters viewport
      gsap.fromTo(bar, {
        width: '0%',
      }, {
        width: percent + '%',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bar.closest('.skill-card'),
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ============================================================
  // 9. PORTFOLIO RENDERING + 3D TILT CARDS + FILTER
  // ============================================================

  /**
   * Portfolio filter — filter projects by category
   */
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.portfolio__filter');
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!filterBtns.length || !portfolioGrid) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active state
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards
        const cards = portfolioGrid.querySelectorAll('.project-card');
        cards.forEach((card) => {
          const category = card.dataset.category || 'all';
          const show = filter === 'all' || category === filter;
          gsap.to(card, {
            opacity: show ? 1 : 0,
            scale: show ? 1 : 0.95,
            duration: 0.3,
            onComplete: () => {
              card.style.display = show ? 'block' : 'none';
            },
          });
        });
      });
    });
  }

  /**
   * Obfuscate phone & email — build via JavaScript to prevent harvester bots
   */
  function initObfuscatedContact() {
    // Phone number
    const phoneEl = document.getElementById('phone-el');
    if (phoneEl) {
      const phone = ['0902', '454', '1458'].join('');
      phoneEl.textContent = phone;
      phoneEl.href = 'tel:+98' + phone;
    }

    // Email address
    const emailEl = document.getElementById('contact-email');
    if (emailEl) {
      const email = ['info', '@', 'mamad', '_dev', '.com'].join('');
      emailEl.textContent = email;
      emailEl.href = 'mailto:' + email;
    }
  }

  /**
   * Generate responsive image srcset for Unsplash URLs
   * Supports WebP and AVIF with multiple breakpoints
   */
  function generateResponsiveSrcset(baseUrl, format) {
    if (!baseUrl || !baseUrl.includes('unsplash.com')) {
      return baseUrl;
    }

    const widths = [400, 600, 800, 1000, 1200];
    const baseWidth = baseUrl.match(/w=\d+/)?.[0] || 'w=800';
    const currentWidth = parseInt(baseWidth.replace('w=', '')) || 800;

    const srcset = widths
      .filter(w => w >= currentWidth * 0.5)
      .map(w => {
        const url = baseUrl.replace(/w=\d+/, `w=${w}`);
        return `${url}&fm=${format} ${w}w`;
      })
      .join(', ');

    return srcset;
  }

  /**
   * Generate picture element with format fallbacks
   */
  function generatePictureElement(project) {
    const imageUrl = project.image_url || project.image || '';
    const title = project.title || 'Project';
    const category = project.category || 'Project';

    // If not Unsplash, return simple img
    if (!imageUrl.includes('unsplash.com')) {
      return `
        <img
          src="${imageUrl}"
          alt="${title} - ${category}"
          loading="lazy"
          decoding="async"
          width="800"
          height="500"
          class="project-card__image"
          onerror="this.parentElement.classList.add('img-error'); this.classList.add('img-error')"
        >
        <div class="project-card__img-skeleton"></div>
      `;
    }

    return `
      <picture>
        <source
          type="image/avif"
          srcset="${generateResponsiveSrcset(imageUrl, 'avif')}"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
        >
        <source
          type="image/webp"
          srcset="${generateResponsiveSrcset(imageUrl, 'webp')}"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
        >
        <img
          src="${imageUrl.replace(/&fm=.*/, '')}"
          srcset="${generateResponsiveSrcset(imageUrl, 'jpg')}"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
          alt="${title} - ${category}"
          loading="lazy"
          decoding="async"
          width="800"
          height="500"
          class="project-card__image"
          onerror="this.parentElement.classList.add('img-error'); this.classList.add('img-error')"
        >
      </picture>
      <div class="project-card__img-skeleton"></div>
    `;
  }

  function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const projects = projectsData.length > 0 ? projectsData : DEFAULT_PROJECTS;

    grid.innerHTML = projects.map((project) => `
      <article class="project-card" data-project-id="${project.id}" data-category="${project.category || 'all'}">
        <div class="project-card__inner" data-tilt>
          <div class="project-card__img">
            ${generatePictureElement(project)}
            <div class="project-card__overlay"></div>
          </div>
          <div class="project-card__body">
            <h3 class="project-card__title">${project.title}</h3>
            <p class="project-card__desc">${project.description}</p>
            ${project.challenge ? `
            <div class="project-card__case-study">
              <div class="case-study__item">
                <span class="case-study__label">Challenge:</span>
                <span class="case-study__text">${project.challenge}</span>
              </div>
              <div class="case-study__item">
                <span class="case-study__label">Solution:</span>
                <span class="case-study__text">${project.solution}</span>
              </div>
              ${project.result ? `
              <div class="case-study__item case-study__result">
                <span class="case-study__label">Result:</span>
                <span class="case-study__text">${project.result}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            <div class="project-card__tags">
              ${(project.tags || []).map((tag) => `<span class="project-card__tag">${tag}</span>`).join('')}
            </div>
            <a href="${project.link}" class="project-card__link">
              مشاهده پروژه
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 2L4 8l6 6"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `).join('');

    // Initialize image load handlers
    initImageLoading();

    // GSAP stagger entrance for cards
    initPortfolioAnimations();
    // 3D tilt effect on hover
    initTiltEffect();
  }

  /**
   * Handle image loading with skeleton fallback
   */
  function initImageLoading() {
    document.querySelectorAll('.blog-card__image, .project-card__image').forEach(img => {
      const wrapper = img.closest('.blog-card__img, .project-card__img');
      const skeleton = wrapper?.querySelector('.blog-card__img-skeleton, .project-card__img-skeleton');

      if (img.complete) {
        img.classList.add('loaded');
        if (skeleton) skeleton.classList.add('hidden');
        return;
      }

      img.addEventListener('load', () => {
        img.classList.add('loaded');
        if (skeleton) skeleton.classList.add('hidden');
      });

      img.addEventListener('error', () => {
        wrapper?.classList.add('img-error');
        img.classList.add('img-error');
        if (skeleton) skeleton.classList.add('hidden');
      });
    });
  }

  function initPortfolioAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set('.project-card', { opacity: 1, y: 0 });
      return;
    }

    // Staggered reveal: cards appear one after another
    gsap.fromTo('.project-card', {
      opacity: 0,
      y: 50,
      scale: 0.95,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#portfolioGrid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  /**
   * 3D Tilt Effect — mouse-tracking perspective transform on project cards.
   * Calculates mouse position relative to card center, applies rotateX/Y.
   */
  function initTiltEffect() {
    // Skip on touch devices and reduced motion
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach((card) => {
      const maxTilt = 8; // Maximum rotation in degrees

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate normalized offset from center (-1 to 1)
        const offsetX = (e.clientX - centerX) / (rect.width / 2);
        const offsetY = (e.clientY - centerY) / (rect.height / 2);

        // Apply rotation: tilt follows mouse
        const rotateY = offsetX * maxTilt;
        const rotateX = -offsetY * maxTilt;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      });

      card.addEventListener('mouseleave', () => {
        // Smoothly reset to flat position
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // ============================================================
  // 10. CONTACT FORM VALIDATION & SUBMISSION
  // ============================================================

  /**
   * ============================================================
   * TOAST NOTIFICATION SYSTEM
   * ============================================================
   */

  /**
   * Toast types: success, error, info, warning
   */
  function showToast(message, type = 'info', duration = 5000) {
    // Remove existing toasts of same type to prevent clutter
    const existingToasts = document.querySelectorAll(`.toast--${type}`);
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    // Icon based on type
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
      <button class="toast__close" aria-label="${window.i18n ? window.i18n.t('toast.closeAria') : 'بستن'}" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    // Add to container (create if not exists)
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-label', window.i18n ? window.i18n.t('toast.containerAria') : 'اعلان‌ها');
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Close button handler
    const closeBtn = toast.querySelector('.toast__close');
    const closeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', closeToast);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }

    return toast;
  }

  /**
   * Escape HTML to prevent XSS in toast messages
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * ============================================================
   * FORM SUBMISSION - API INTEGRATION
   * ============================================================
   */

  // Track submission state to prevent duplicates
  let isSubmitting = false;

  /**
   * Submit contact form to API endpoint
   * @param {Object} data - { name, email, message }
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async function submitContactForm(data) {
    const endpoint = `${API_BASE}/api/contact`;

    // DEBUG: Log submission attempt
    console.debug('[Contact] Submitting form:', {
      name: data.name.substring(0, 20) + '...',
      email: data.email,
      messageLength: data.message.length
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        // Add timestamp to prevent caching
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          message: data.message.trim()
        })
      });

      // Parse response
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { success: response.ok, error: response.statusText };
      }

      // DEBUG: Log response
      console.debug('[Contact] Response:', {
        status: response.status,
        success: result.success,
        error: result.error
      });

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return { success: true, message: result.message || (window.i18n ? window.i18n.t('contact.form.success') : 'پیام شما با موفقیت ارسال شد!') };

    } catch (error) {
      // DEBUG: Log error
      console.error('[Contact] Submission failed:', {
        error: error.message,
        type: error.name,
        endpoint
      });

      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(window.i18n ? window.i18n.t('contact.form.errors.networkError') : 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }

      if (error.message.includes('429')) {
        throw new Error(window.i18n ? window.i18n.t('contact.form.errors.rateLimit') : 'تعداد درخواست‌های شما زیاد است. لطفاً چند دقیقه صبر کنید.');
      }

      throw error;
    }
  }

  /**
   * ============================================================
   * CONTACT FORM INITIALIZATION
   * ============================================================
   */

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
      console.warn('[Contact] Form not found');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn__text');

    // Field configurations with validation
    const fields = {
      contactName: {
        element: document.getElementById('contactName'),
        errorEl: document.getElementById('nameError'),
        validate(value) {
          const tr = (k) => window.i18n ? window.i18n.t(k) : '';
          if (!value || !value.trim()) return tr('contact.form.errors.nameRequired') || 'لطفاً نام خود را وارد کنید.';
          if (value.trim().length < 2) return tr('contact.form.errors.nameMin') || 'نام باید حداقل ۲ کاراکتر باشد.';
          if (value.trim().length > 100) return tr('contact.form.errors.nameMax') || 'نام نباید بیش از ۱۰۰ کاراکتر باشد.';
          if (/[<>{}]/.test(value)) return tr('contact.form.errors.nameInvalid') || 'کاراکترهای غیرمجاز وارد شده است.';
          return '';
        }
      },
      contactEmail: {
        element: document.getElementById('contactEmail'),
        errorEl: document.getElementById('emailError'),
        validate(value) {
          const tr = (k) => window.i18n ? window.i18n.t(k) : '';
          if (!value || !value.trim()) return tr('contact.form.errors.emailRequired') || 'لطفاً ایمیل خود را وارد کنید.';
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          if (!emailRegex.test(value.trim())) return tr('contact.form.errors.emailInvalid') || 'لطفاً یک ایمیل معتبر وارد کنید.';
          if (value.length > 254) return tr('contact.form.errors.emailMax') || 'ایمیل نامعتبر است.';
          return '';
        }
      },
      contactMessage: {
        element: document.getElementById('contactMessage'),
        errorEl: document.getElementById('messageError'),
        validate(value) {
          const tr = (k) => window.i18n ? window.i18n.t(k) : '';
          if (!value || !value.trim()) return tr('contact.form.errors.messageRequired') || 'لطفاً پیام خود را بنویسید.';
          if (value.trim().length < 10) return tr('contact.form.errors.messageMin') || 'پیام باید حداقل ۱۰ کاراکتر باشد.';
          if (value.trim().length > 2000) return tr('contact.form.errors.messageMax') || 'پیام نباید بیش از ۲۰۰۰ کاراکتر باشد.';
          if (/<script|javascript:|on\w+=/i.test(value)) return tr('contact.form.errors.messageInvalid') || 'محتوای غیرمجاز شناسایی شد.';
          return '';
        }
      }
    };

    /**
     * Show field error with visual feedback
     */
    function showFieldError(fieldConfig, message) {
      if (!fieldConfig || !fieldConfig.element) return;

      const { element, errorEl } = fieldConfig;

      // Update error message
      if (errorEl) {
        errorEl.textContent = message;
      }

      // Update input styling
      element.classList.toggle('invalid', !!message);
      element.classList.toggle('valid', !message && element.value.trim());

      // DEBUG: Log validation
      if (message) {
        console.debug('[Validation] Error:', {
          field: element.id,
          message: message.substring(0, 30)
        });
      }
    }

    /**
     * Clear all field errors and reset touched state
     */
    function clearFieldErrors() {
      Object.values(fields).forEach(field => {
        if (field.errorEl) field.errorEl.textContent = '';
        if (field.element) {
          field.element.classList.remove('invalid', 'valid', 'touched');
        }
      });
    }

    /**
     * Validate all fields
     * @returns {boolean} - true if all fields are valid
     */
    function validateAllFields() {
      let isValid = true;

      Object.entries(fields).forEach(([id, field]) => {
        const error = field.validate(field.element?.value || '');
        showFieldError(field, error);
        if (error) isValid = false;
      });

      return isValid;
    }

    /**
     * Validate single field on blur
     */
    Object.entries(fields).forEach(([id, field]) => {
      if (!field.element) return;

      // Validate on blur
      field.element.addEventListener('blur', () => {
        // Only validate on blur if field has been touched
        if (field.element.classList.contains('touched')) {
          const error = field.validate(field.element.value);
          showFieldError(field, error);
        }
      });

      // Mark as touched on first input
      field.element.addEventListener('input', () => {
        if (!field.element.classList.contains('touched')) {
          field.element.classList.add('touched');
        }

        // Real-time validation feedback (only if already has error)
        if (field.element.classList.contains('invalid')) {
          const error = field.validate(field.element.value);
          showFieldError(field, error);
        }
      });

      // Clear invalid state on focus
      field.element.addEventListener('focus', () => {
        field.element.classList.remove('invalid');
        if (field.errorEl) field.errorEl.textContent = '';
      });
    });

    /**
     * Update button state
     */
    function setButtonState(state) {
      if (!submitBtn || !btnText) return;
      const tr = (k, d) => window.i18n ? (window.i18n.t(k) || d) : d;

      const states = {
        idle: {
          text: tr('contact.form.submit', 'درخواست مشاوره رایگان'),
          disabled: false,
          class: ''
        },
        loading: {
          text: tr('contact.form.submitting', 'در حال ارسال...'),
          disabled: true,
          class: 'loading'
        },
        success: {
          text: tr('contact.form.success', '✓ پیام ارسال شد!'),
          disabled: true,
          class: 'success'
        },
        error: {
          text: tr('contact.form.errorRetry', 'خطا - تلاش مجدد'),
          disabled: false,
          class: 'error'
        }
      };

      const config = states[state] || states.idle;

      btnText.textContent = config.text;
      submitBtn.disabled = config.disabled;
      submitBtn.classList.remove('loading', 'success', 'error');
      if (config.class) submitBtn.classList.add(config.class);
    }

    /**
     * Handle form submission
     */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Prevent duplicate submissions
      if (isSubmitting) {
        console.debug('[Contact] Duplicate submission prevented');
        return;
      }

      // Validate all fields
      if (!validateAllFields()) {
        showToast(window.i18n ? window.i18n.t('contact.form.errors.validationSummary') : 'لطفاً خطاهای فرم را برطرف کنید.', 'warning');
        // Focus first invalid field
        const firstInvalid = form.querySelector('.invalid');
        firstInvalid?.focus();
        return;
      }

      // Collect form data
      const formData = {
        name: fields.contactName.element?.value.trim() || '',
        email: fields.contactEmail.element?.value.trim() || '',
        message: fields.contactMessage.element?.value.trim() || ''
      };

      // Set loading state
      isSubmitting = true;
      setButtonState('loading');
      clearFieldErrors();

      // DEBUG: Log submission start
      console.debug('[Contact] Form submission started');

      try {
        const result = await submitContactForm(formData);

        // Success!
        setButtonState('success');
        showToast(result.message || (window.i18n ? window.i18n.t('contact.form.success') : 'پیام شما با موفقیت ارسال شد!'), 'success');

        // Reset form
        form.reset();
        clearFieldErrors();
        Object.keys(fields).forEach(id => {
          if (fields[id].element) {
            fields[id].element.classList.remove('touched', 'valid', 'invalid');
          }
        });

        // Reset button after delay
        setTimeout(() => {
          setButtonState('idle');
        }, 3000);

        // DEBUG: Log success
        console.debug('[Contact] Form submitted successfully');

      } catch (error) {
        // Handle error
        setButtonState('error');
        showToast(error.message || (window.i18n ? window.i18n.t('contact.form.errors.submitError') : 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.'), 'error');

        // Reset button after delay
        setTimeout(() => {
          setButtonState('idle');
        }, 3000);

        // DEBUG: Log error (already logged in submitContactForm)
      } finally {
        // Re-enable submission
        isSubmitting = false;
      }
    });

    // DEBUG: Log initialization
    console.debug('[Contact] Form initialized', {
      formExists: !!form,
      submitBtnExists: !!submitBtn,
      apiEndpoint: `${API_BASE}/api/contact`
    });
  }

  // ============================================================
  // 11. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10);
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      // Check reduced motion for instant scroll
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  // ============================================================
  // BOOTSTRAP — initialize everything when DOM is ready
  // ============================================================

  async function init() {
    // Easter egg
    console.log("👋 Hey developer! Like what you see? Let's work together.");

    // Load data from API (with fallback to static data)
    await loadAllData();

    // Render content
    renderSkills();
    renderPortfolio();

    // Initialize image loading handlers (skeleton + error states)
    initImageLoading();

    // Initialize UI components
    initLoader();
    initNav();
    initThreeJS();
    initScrollAnimations();
    initScrollProgress();
    initBackToTop();
    initActiveNavLinks();
    initContactForm();
    initSmoothScroll();
    initPortfolioFilter();
    initObfuscatedContact();
  }

  // Wait for DOM + all scripts (GSAP, Three.js) to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Clean up Three.js on page unload
  window.addEventListener('beforeunload', disposeThreeJS);

})();
