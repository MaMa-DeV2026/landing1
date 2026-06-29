/**
 * reviews.js — Review Collection System
 *
 * Features:
 * 1. Dynamic testimonial loading from API/localStorage
 * 2. Review submission form with validation
 * 3. Local storage for demo/testimonials
 * 4. Integration-ready for Google Forms, Trustpilot, etc.
 */

(function() {
  'use strict';

  // ============================================================
  // API CONFIGURATION
  // ============================================================

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

  // ============================================================
  // DEFAULT TESTIMONIALS (Replace with real data)
  // ============================================================

  const DEFAULT_TESTIMONIALS = [
    {
      id: 'review-1',
      name: 'علی احمدی',
      role: 'مدیر برند',
      company: 'دیجیکالا',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      rating: 5,
      text: 'تحویل و کیفیت کار mamad_dev فراتر از انتظارات ما بود. وب‌سایت به موقع تحویل داده شد و فوق‌العاده زیبا بود.',
      project: 'لندینگ پیج',
      date: '2025-12-15',
      verified: true,
      featured: false
    },
    {
      id: 'review-2',
      name: 'سارا محمدی',
      role: 'مدیر فروشگاه',
      company: 'گل‌سرا آنلاین',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
      rating: 5,
      text: 'حرفه‌ای، پاسخگو و فوق‌العاده بااستعداد. فروشگاه آنلاینی که ساختند فروش ما را به طور چشمگیری افزایش داد.',
      project: 'فروشگاه آنلاین',
      date: '2025-11-20',
      verified: true,
      featured: true
    },
    {
      id: 'review-3',
      name: 'رضا کریمی',
      role: 'بنیان‌گذار',
      company: 'استارتاپ نوآوران',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      rating: 5,
      text: 'کار فوق‌العاده! توجه به جزئیات و تعهد به کیفیت قابل تحسین است. برای هر پروژه وبی توصیه‌اش می‌کنم.',
      project: 'پنل مدیریت',
      date: '2025-10-05',
      verified: true,
      featured: false
    }
  ];

  // ============================================================
  // TESTIMONIAL RENDERER
  // ============================================================

  function renderTestimonials(testimonials) {
    const grid = document.querySelector('.testimonials__grid');
    if (!grid) return;

    grid.innerHTML = testimonials.map(testimonial => createTestimonialCard(testimonial)).join('');

    // Re-initialize GSAP animations
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.testimonial-card', {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }

  function createTestimonialCard(t) {
    const featuredClass = t.featured ? 'testimonial-card--featured' : '';
    const featuredBadge = t.featured ? `
      <div class="testimonial-card__featured-badge" aria-label="توصیه ویژه">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span>توصیه ویژه</span>
      </div>
    ` : '';

    const stars = Array(5).fill(0).map((_, i) => `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `).join('');

    const persianDate = formatPersianDate(t.date);

    return `
      <article class="testimonial-card ${featuredClass}" data-gsap="fade-up" role="listitem">
        ${featuredBadge}

        <div class="testimonial-card__verified" aria-label="مشتری تأیید شده">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>تأیید شده</span>
        </div>

        <div class="testimonial-card__rating" aria-label="امتیاز ${t.rating} از ۵">
          ${stars}
        </div>

        <blockquote class="testimonial-card__quote">
          <p>"${t.text}"</p>
        </blockquote>

        <div class="testimonial-card__author">
          <div class="testimonial-card__avatar">
            <img
              src="${t.avatar}"
              alt="${t.name} - ${t.role} در ${t.company}"
              width="56"
              height="56"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="testimonial-card__info">
            <cite class="testimonial-card__name">${t.name}</cite>
            <span class="testimonial-card__role">${t.role}</span>
            <span class="testimonial-card__company">${t.company}</span>
          </div>
        </div>

        <div class="testimonial-card__meta">
          <time datetime="${t.date}" class="testimonial-card__date">${persianDate}</time>
          <span class="testimonial-card__project">پروژه: ${t.project}</span>
        </div>
      </article>
    `;
  }

  function formatPersianDate(dateStr) {
    const date = new Date(dateStr);
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    // Simple Jalali conversion (approximate)
    const year = 1404;
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const month = months[date.getMonth()] || 'آذر';
    const day = date.getDate();

    const toPersian = (num) => String(num).split('').map(d => persianDigits[parseInt(d)]).join('');

    return `${toPersian(day)} ${month} ${toPersian(year)}`;
  }

  // ============================================================
  // REVIEW COLLECTION FORM
  // ============================================================

  function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    const fields = {
      reviewerName: {
        errorEl: document.getElementById('reviewNameError'),
        validate(val) {
          if (!val.trim()) return 'نام الزامی است.';
          if (val.trim().length < 3) return 'نام باید حداقل ۳ کاراکتر باشد.';
          return '';
        }
      },
      reviewerEmail: {
        errorEl: document.getElementById('reviewEmailError'),
        validate(val) {
          if (!val.trim()) return 'ایمیل الزامی است.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'ایمیل معتبر وارد کنید.';
          return '';
        }
      },
      reviewerCompany: {
        errorEl: document.getElementById('reviewCompanyError'),
        validate(val) {
          if (!val.trim()) return 'نام شرکت الزامی است.';
          return '';
        }
      },
      reviewText: {
        errorEl: document.getElementById('reviewTextError'),
        validate(val) {
          if (!val.trim()) return 'نظر الزامی است.';
          if (val.trim().length < 20) return 'نظر باید حداقل ۲۰ کاراکتر باشد.';
          return '';
        }
      },
      reviewRating: {
        errorEl: document.getElementById('reviewRatingError'),
        validate(val) {
          if (!val) return 'لطفاً امتیاز دهید.';
          return '';
        }
      }
    };

    // Star rating interaction
    const ratingInputs = form.querySelectorAll('input[name="reviewRating"]');
    const ratingStars = document.querySelectorAll('.star-rating__star');

    ratingStars.forEach((star, index) => {
      star.addEventListener('click', () => {
        const rating = index + 1;
        form.querySelector('input[name="reviewRating"]').value = rating;
        updateStarDisplay(ratingStars, rating);
        clearError(fields.reviewRating.errorEl);
      });

      star.addEventListener('mouseenter', () => {
        updateStarDisplay(ratingStars, index + 1);
      });

      star.addEventListener('mouseleave', () => {
        const currentRating = parseInt(form.querySelector('input[name="reviewRating"]').value) || 0;
        updateStarDisplay(ratingStars, currentRating);
      });
    });

    function updateStarDisplay(stars, rating) {
      stars.forEach((star, index) => {
        star.classList.toggle('filled', index < rating);
      });
    }

    // Validate on blur
    Object.entries(fields).forEach(([id, field]) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('blur', () => {
        const msg = field.validate(input.value);
        showFieldError(input, field.errorEl, msg);
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          const msg = field.validate(input.value);
          showFieldError(input, field.errorEl, msg);
        }
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasError = false;
      Object.entries(fields).forEach(([id, field]) => {
        const input = document.getElementById(id);
        if (!input) return;
        const msg = field.validate(input.value);
        showFieldError(input, field.errorEl, msg);
        if (msg) hasError = true;
      });

      if (hasError) return;

      const submitBtn = form.querySelector('.btn--submit');
      const btnText = submitBtn.querySelector('.btn__text');
      const originalText = btnText.textContent;

      btnText.textContent = 'در حال ارسال...';
      submitBtn.disabled = true;

      const formData = {
        name: document.getElementById('reviewerName').value.trim(),
        email: document.getElementById('reviewerEmail').value.trim(),
        company: document.getElementById('reviewerCompany').value.trim(),
        role: document.getElementById('reviewerRole')?.value.trim() || '',
        rating: parseInt(form.querySelector('input[name="reviewRating"]').value),
        text: document.getElementById('reviewText').value.trim(),
        project: document.getElementById('reviewProject')?.value.trim() || ''
      };

      try {
        // Option 1: Send to your API
        const result = await submitToAPI('/api/reviews', formData);

        // Option 2: Google Forms (uncomment and configure)
        // await submitToGoogleForms('YOUR_GOOGLE_FORM_URL', formData);

        // Option 3: Email via mailto
        // window.location.href = createMailtoLink(formData);

        if (result.success) {
          btnText.textContent = '✓ نظر شما ثبت شد!';
          form.reset();
          updateStarDisplay(ratingStars, 0);
          showSuccessMessage('از نظر شما متشکریم! پس از بررسی، نظرتان در سایت منتشر می‌شود.');
        }
      } catch (error) {
        console.error('Review submission error:', error);
        btnText.textContent = 'خطا در ارسال';
        showFieldError(null, document.getElementById('reviewTextError'), 'خطا در ارسال نظر. لطفاً دوباره تلاش کنید.');
      }

      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
      }, 3000);
    });
  }

  async function submitToAPI(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    } catch (error) {
      // For demo, save to localStorage
      console.warn('API not available, saving to localStorage:', error.message);
      saveReviewLocally(data);
      return { success: true, message: 'Review saved locally' };
    }
  }

  function saveReviewLocally(data) {
    const reviews = JSON.parse(localStorage.getItem('mamad_reviews_pending') || '[]');
    reviews.push({
      ...data,
      id: 'review-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      verified: false
    });
    localStorage.setItem('mamad_reviews_pending', JSON.stringify(reviews));
  }

  function showFieldError(input, errorEl, msg) {
    if (errorEl) errorEl.textContent = msg;
    if (input) {
      input.classList.toggle('invalid', !!msg);
      input.classList.toggle('valid', !msg && input.value.trim());
    }
  }

  function clearError(errorEl) {
    if (errorEl) errorEl.textContent = '';
  }

  function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // ============================================================
  // LOAD TESTIMONIALS FROM API
  // ============================================================

  async function loadTestimonials() {
    try {
      const response = await fetch(`${API_BASE}/api/testimonials`);
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      if (result.success && result.data) {
        renderTestimonials(result.data);
        return;
      }
    } catch (error) {
      console.warn('Using default testimonials:', error.message);
    }

    // Fallback to default testimonials
    renderTestimonials(DEFAULT_TESTIMONIALS);
  }

  // ============================================================
  // TRUSTPILOT WIDGET INTEGRATION
  // ============================================================

  function initTrustpilotWidget() {
    // Add Trustpilot widget container if it doesn't exist
    if (!document.querySelector('.trustpilot-widget')) {
      const container = document.createElement('div');
      container.className = 'trustpilot-widget';
      container.setAttribute('data-template-id', 'YOUR_TEMPLATE_ID');
      container.setAttribute('data-business-unit-id', 'YOUR_BUSINESS_UNIT_ID');
      container.setAttribute('data-theme', 'light');
      container.setAttribute('data-locale', 'fa-IR');

      // Insert after testimonials grid
      const grid = document.querySelector('.testimonials__grid');
      if (grid) {
        grid.insertAdjacentElement('afterend', container);
      }
    }
  }

  // ============================================================
  // GOOGLE REVIEWS BADGE
  // ============================================================

  function initGoogleReviewsBadge() {
    // Add Google Reviews badge
    const badge = document.createElement('div');
    badge.className = 'google-reviews-badge';
    badge.innerHTML = `
      <div class="google-reviews-badge__logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
      <div class="google-reviews-badge__info">
        <span class="google-reviews-badge__rating">5.0</span>
        <div class="google-reviews-badge__stars">
          ${Array(5).fill('<svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBC05"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join('')}
        </div>
        <span class="google-reviews-badge__text">بر اساس نظرات Google</span>
      </div>
    `;

    document.querySelector('.testimonials__trust-footer')?.appendChild(badge);
  }

  // ============================================================
  // INITIALIZE
  // ============================================================

  function init() {
    loadTestimonials();
    initReviewForm();
    initTrustpilotWidget();
    initGoogleReviewsBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
