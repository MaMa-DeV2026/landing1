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
        throw new Error(data.error || 'خطا در ارتباط با سرور');
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
    { id: 'ui-ux', name: 'طراحی UI/UX', percentage: 92 },
    { id: 'html-css', name: 'HTML & CSS', percentage: 95 },
    { id: 'javascript', name: 'JavaScript', percentage: 80 },
    { id: 'figma', name: 'Figma', percentage: 88 },
    { id: 'responsive', name: 'طراحی ریسپانسیو', percentage: 90 },
    { id: 'adobe-xd', name: 'Adobe XD', percentage: 75 },
  ];

  const DEFAULT_PROJECTS = [
    {
      id: 'proj-1',
      title: 'Lumina — پنل مدیریت SaaS',
      description: 'طراحی رابط کاربری برای یک پنل تحلیل داده با قابلیت نمایش اطلاعات لحظه‌ای و پشتیبانی از حالت تاریک.',
      tags: ['Figma', 'UI/UX', 'CSS'],
      image: 'https://cdn.dribbble.com/userupload/43111624/file/original-52851378199548dd20f80f06ed4448b3.png?format=webp&resize=1000x750&vertical=center',
      link: '#',
    },
    {
      id: 'proj-2',
      title: 'Bloom — فروشگاه آنلاین گل',
      description: 'طراحی تجربه کاربری کامل برای یک فروشگاه اینترنتی با رویکرد موبایل‌فرست و انیمیشن‌های روان.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: 'https://cdn.dribbble.com/userupload/37233954/file/original-bbded23d0654a44bcdf825cc541142ef.png?format=webp&resize=800x600&vertical=center',
      link: '#',
    },
    {
      id: 'proj-3',
      title: 'Forge — وب‌سایت آژانس دیجیتال',
      description: 'طراحی وب‌سایت معرفی برای یک آژانس دیجیتال با تمرکز بر تجربه اسکرول و هویت بصری قوی.',
      tags: ['Figma', 'GSAP', 'CSS'],
      image: 'https://cdn.dribbble.com/userupload/44350275/file/6eea7358e580c7821da3b941d08bb92d.png?format=webp&resize=1000x750&vertical=center',
      link: '#',
    },
    {
      id: 'proj-4',
      title: 'Zeno — وبلاگ شخصی',
      description: 'طراحی وبلاگ با رویکرد محتوامحور، خوانایی بالا و سرعت بارگذاری بهینه.',
      tags: ['UI Design', 'Typography', 'CSS'],
      image: 'https://cdn.dribbble.com/userupload/8449020/file/original-86e598825b4c6e3b77afccfc3a37247c.png?resize=2048x1536&vertical=center',
      link: '#',
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
  // 3. LOADING SCREEN — GSAP Timeline
  // ============================================================

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Check reduced motion — skip animation if user prefers it
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tl = gsap.timeline({
      onComplete: () => {
        loader.setAttribute('aria-hidden', 'true');
        gsap.set(loader, { display: 'none' });
        initHeroAnimations();
      },
    });

    if (prefersReduced) {
      // Instant reveal for reduced-motion users
      gsap.set(loader, { display: 'none' });
      loader.setAttribute('aria-hidden', 'true');
      initHeroAnimations();
      return;
    }

    // Animate logo letters staggered in
    tl.fromTo('.loader__logo-letter', {
      opacity: 0,
      y: 20,
      rotateX: -90,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.7)',
    })
    // Progress bar fill
    .to('.loader__bar', {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut',
    }, '-=0.3')
    // Fade out the entire loader
    .to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    }, '+=0.3');
  }

  // ============================================================
  // 3. CUSTOM CURSOR
  // ============================================================

  function initCursor() {
    // Skip on touch devices or reduced motion
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');

    // Both dot and ring follow mouse EXACTLY — positioned at mouse coordinates
    document.addEventListener('mousemove', (e) => {
      // Use left/top + translate(-50%, -50%) so center lands on cursor
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      gsap.set(dot, { x: 0, y: 0 });
      gsap.set(ring, { x: 0, y: 0 });
    });

    // Expand ring on interactive elements
    const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, .project-card__inner, .skill-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursor.classList.add('cursor--hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursor.classList.remove('cursor--hover');
      }
    });

    // Hide cursor when leaving the viewport
    document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
  }

  // ============================================================
  // 4. NAVIGATION — Hamburger + Overlay + GSAP Stagger
  // ============================================================

  function initNav() {
    const hamburger = document.getElementById('navHamburger');
    const overlay = document.getElementById('navOverlay');
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
  // 9. PORTFOLIO RENDERING + 3D TILT CARDS
  // ============================================================

  function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const projects = projectsData.length > 0 ? projectsData : DEFAULT_PROJECTS;

    grid.innerHTML = projects.map((project) => `
      <article class="project-card" data-project-id="${project.id}">
        <div class="project-card__inner" data-tilt>
          <div class="project-card__img">
            <img src="${project.image_url || project.image || ''}" alt="${project.title}" loading="lazy">
            <div class="project-card__overlay"></div>
          </div>
          <div class="project-card__body">
            <h3 class="project-card__title">${project.title}</h3>
            <p class="project-card__desc">${project.description}</p>
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

    // GSAP stagger entrance for cards
    initPortfolioAnimations();
    // 3D tilt effect on hover
    initTiltEffect();
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
  // 10. CONTACT FORM VALIDATION
  // ============================================================

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');

    const fields = {
      contactName: {
        errorEl: document.getElementById('nameError'),
        validate(val) {
          if (!val.trim()) return 'وارد کردن نام الزامی است.';
          if (val.trim().length < 2) return 'نام وارد‌شده معتبر نمی‌باشد.';
          return '';
        },
      },
      contactEmail: {
        errorEl: document.getElementById('emailError'),
        validate(val) {
          if (!val.trim()) return 'وارد کردن نشانی رایانامه الزامی است.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'نشانی رایانامه معتبر نمی‌باشد.';
          return '';
        },
      },
      contactMessage: {
        errorEl: document.getElementById('messageError'),
        validate(val) {
          if (!val.trim()) return 'متن پیام نمی‌تواند خالی باشد.';
          if (val.trim().length < 10) return 'پیام باید حداقل شامل ده کاراکتر باشد.';
          return '';
        },
      },
    };

    // Validate on blur
    Object.entries(fields).forEach(([id, field]) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('blur', () => {
        const msg = field.validate(input.value);
        showFieldError(input, field.errorEl, msg);
      });

      // Clear error on input (only if previously invalid)
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          const msg = field.validate(input.value);
          showFieldError(input, field.errorEl, msg);
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasError = false;
      Object.entries(fields).forEach(([id, field]) => {
        const input = document.getElementById(id);
        const msg = field.validate(input.value);
        showFieldError(input, field.errorEl, msg);
        if (msg) hasError = true;
      });

      if (hasError) return;

      // Submit to API
      const btnText = submitBtn.querySelector('.btn__text');
      const originalText = btnText.textContent;
      btnText.textContent = 'در حال ارسال...';
      submitBtn.disabled = true;

      const formData = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        message: document.getElementById('contactMessage').value.trim(),
      };

      const result = await fetchAPI('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (result && result.success) {
        btnText.textContent = '✓ پیام ارسال شد';
        form.reset();
        Object.entries(fields).forEach(([id, field]) => {
          const input = document.getElementById(id);
          input.classList.remove('valid', 'invalid');
          if (field.errorEl) field.errorEl.textContent = '';
        });
      } else {
        btnText.textContent = 'خطا در ارسال';
        showFieldError(
          document.getElementById('messageError'),
          'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.'
        );
      }

      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
      }, 3000);
    });
  }

  /**
   * showFieldError — update error message and input class.
   */
  function showFieldError(input, errorEl, msg) {
    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle('invalid', !!msg);
    input.classList.toggle('valid', !msg && input.value.trim() !== '');
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

    // Initialize UI components
    initLoader();
    initCursor();
    initNav();
    initThreeJS();
    initScrollAnimations();
    initScrollProgress();
    initBackToTop();
    initActiveNavLinks();
    initContactForm();
    initSmoothScroll();
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
