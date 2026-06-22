/*
 * admin.js — Admin Panel Application
 *
 * Modules:
 *   1. Auth — JWT login with localStorage token storage
 *   2. Tab switching
 *   3. Projects CRUD — render, add, edit, delete with modal via API
 *   4. Skills CRUD — render, edit percentage via API
 *   5. Messages — view and manage contact form submissions
 *   6. Toast notifications
 *   7. Modal management
 *
 * All data synced with backend API.
 */

(function () {
  'use strict';

  // ============================================================
  // API CONFIGURATION
  // ============================================================

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

  const TOKEN_KEY = 'portfolio_admin_token';

  // ============================================================
  // API HELPERS
  // ============================================================

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function fetchAPI(endpoint, options = {}) {
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token invalid or expired
          removeToken();
          showLogin();
          showToast('نشست منقضی شده. لطفاً دوباره وارد شوید.', 'error');
        }
        throw new Error(data.error || 'خطا در ارتباط با سرور');
      }

      return data;
    } catch (error) {
      console.error('[API] Error:', error);
      showToast(error.message || 'خطا در ارتباط با سرور', 'error');
      return null;
    }
  }

  // ============================================================
  // 1. AUTH — JWT authentication
  // ============================================================

  /**
   * checkAuth — verify token and show appropriate screen.
   */
  async function checkAuth() {
    const token = getToken();

    if (!token) {
      showLogin();
      return;
    }

    // Verify token with server
    const result = await fetchAPI('/api/admin/verify');

    if (result && result.success) {
      showDashboard();
    } else {
      removeToken();
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById('loginScreen').hidden = false;
    document.getElementById('adminDashboard').hidden = true;
  }

  function showDashboard() {
    document.getElementById('loginScreen').hidden = true;
    document.getElementById('adminDashboard').hidden = false;
    loadAllData();
  }

  /**
   * login — authenticate and store JWT token.
   */
  async function login(username, password) {
    const result = await fetchAPI('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result && result.success) {
      setToken(result.token);
      showToast('خوش اومدی! 👋', 'success');
      showDashboard();
      return true;
    }
    return false;
  }

  /**
   * logout — remove token and show login.
   */
  async function logout() {
    await fetchAPI('/api/admin/logout', { method: 'POST' });
    removeToken();
    showToast('با موفقیت خارج شدی', 'success');
    showLogin();
  }

  // ============================================================
  // 2. DATA LOADING
  // ============================================================

  let projectsData = [];
  let skillsData = [];
  let messagesData = [];

  async function loadProjects() {
    const result = await fetchAPI('/api/portfolio');
    if (result && result.success) {
      projectsData = result.data;
      renderProjects();
    }
  }

  async function loadSkills() {
    const result = await fetchAPI('/api/skills');
    if (result && result.success) {
      skillsData = result.data;
      renderSkills();
    }
  }

  async function loadMessages() {
    const result = await fetchAPI('/api/messages');
    if (result && result.success) {
      messagesData = result.data;
      renderMessages();
    }
  }

  async function loadAllData() {
    await Promise.all([loadProjects(), loadSkills(), loadMessages()]);
  }

  // ============================================================
  // 3. TAB SWITCHING
  // ============================================================

  function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');

        // Update tab active state
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Show corresponding panel
        panels.forEach((p) => {
          p.classList.remove('active');
          p.hidden = true;
        });

        const targetPanel = document.getElementById('tab' + capitalize(targetId));
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.hidden = false;
        }

        // Load data for the active tab
        if (targetId === 'projects') loadProjects();
        else if (targetId === 'skills') loadSkills();
        else if (targetId === 'messages') loadMessages();
      });
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ============================================================
  // 4. PROJECTS CRUD
  // ============================================================

  function renderProjects() {
    const container = document.getElementById('projectsList');
    if (!container) return;

    if (projectsData.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>هنوز پروژه‌ای اضافه نکردی.</p>
          <button class="btn btn--primary btn--sm" onclick="document.getElementById('addProjectBtn').click()">
            اولین پروژه رو اضافه کن
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = projectsData.map((project) => `
      <article class="project-item" data-project-id="${project.id}">
        <div class="project-item__img">
          ${project.image_url
            ? `<img src="${project.image_url}" alt="${escapeHtml(project.title)}" loading="lazy">`
            : defaultProjectSVG(project.title)
          }
        </div>
        <div class="project-item__body">
          <h3 class="project-item__title">${escapeHtml(project.title)}</h3>
          <p class="project-item__desc">${escapeHtml(project.description)}</p>
          <div class="project-item__tags">
            ${(project.tags || []).map((tag) => `<span class="project-item__tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="project-item__actions">
            <button class="btn btn--outline btn--sm btn--edit-project" data-id="${project.id}">
              ویرایش
            </button>
            <button class="btn btn--danger btn--sm btn--delete-project" data-id="${project.id}">
              حذف
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Bind edit/delete buttons
    container.querySelectorAll('.btn--edit-project').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    container.querySelectorAll('.btn--delete-project').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteProject(id);
      });
    });
  }

  function defaultProjectSVG(title) {
    const encodedTitle = encodeURIComponent(title || 'پروژه');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
      <rect fill="#292524" width="800" height="450"/>
      <rect x="40" y="40" width="720" height="300" rx="12" fill="#44403c" opacity="0.3"/>
      <text x="400" y="400" text-anchor="middle" fill="#a8a29e" font-family="sans-serif" font-size="18">${encodedTitle}</text>
    </svg>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function deleteProject(id) {
    if (!confirm('مطمئنی می‌خوای این پروژه رو حذف کنی؟')) return;

    const result = await fetchAPI(`/api/portfolio/${id}`, { method: 'DELETE' });

    if (result && result.success) {
      showToast('پروژه حذف شد', 'success');
      loadProjects();
    }
  }

  // ============================================================
  // 5. PROJECT MODAL — Add / Edit
  // ============================================================

  function initProjectModal() {
    const addBtn = document.getElementById('addProjectBtn');
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('modalCancel');
    const backdrop = document.getElementById('projectModalBackdrop');
    const form = document.getElementById('projectForm');

    if (!addBtn || !modal) return;

    addBtn.addEventListener('click', () => openNewModal());

    function closeModal() {
      modal.hidden = true;
      form.reset();
      clearFormErrors();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateProjectForm()) return;

      const projectData = {
        title: document.getElementById('projTitle').value.trim(),
        description: document.getElementById('projDesc').value.trim(),
        tags: document.getElementById('projTags').value.split(',').map((t) => t.trim()).filter(Boolean),
        image_url: document.getElementById('projImage').value.trim(),
        link: document.getElementById('projLink').value.trim() || '#',
      };

      const projId = document.getElementById('projId').value;
      const isEdit = !!projId;

      let result;
      if (isEdit) {
        result = await fetchAPI(`/api/portfolio/${projId}`, {
          method: 'PUT',
          body: JSON.stringify(projectData),
        });
      } else {
        result = await fetchAPI('/api/portfolio', {
          method: 'POST',
          body: JSON.stringify(projectData),
        });
      }

      if (result && result.success) {
        showToast(isEdit ? 'پروژه ویرایش شد ✅' : 'پروژه جدید اضافه شد 🎉', 'success');
        closeModal();
        loadProjects();
      }
    });
  }

  function openNewModal() {
    const modal = document.getElementById('projectModal');
    document.getElementById('projId').value = '';
    document.getElementById('modalTitle').textContent = 'پروژه جدید';
    document.getElementById('projectForm').reset();
    clearFormErrors();
    modal.hidden = false;
  }

  function openEditModal(id) {
    const project = projectsData.find((p) => p.id === id);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    document.getElementById('projId').value = project.id;
    document.getElementById('modalTitle').textContent = 'ویرایش پروژه';
    document.getElementById('projTitle').value = project.title;
    document.getElementById('projDesc').value = project.description;
    document.getElementById('projTags').value = (project.tags || []).join(', ');
    document.getElementById('projImage').value = project.image_url || '';
    document.getElementById('projLink').value = project.link || '';
    clearFormErrors();
    modal.hidden = false;
  }

  function validateProjectForm() {
    let valid = true;
    clearFormErrors();

    const title = document.getElementById('projTitle');
    const desc = document.getElementById('projDesc');

    if (!title.value.trim()) {
      showFieldError('projTitleError', 'عنوان پروژه الزامیه');
      title.classList.add('invalid');
      valid = false;
    }

    if (!desc.value.trim()) {
      showFieldError('projDescError', 'توضیحات الزامیه');
      desc.classList.add('invalid');
      valid = false;
    }

    return valid;
  }

  function clearFormErrors() {
    ['projTitleError', 'projDescError'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    document.querySelectorAll('#projectForm .form__input').forEach((el) => {
      el.classList.remove('invalid');
    });
  }

  function showFieldError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = message;
  }

  // ============================================================
  // 6. SKILLS CRUD
  // ============================================================

  function renderSkills() {
    const container = document.getElementById('skillsList');
    if (!container) return;

    if (skillsData.length === 0) {
      container.innerHTML = '<p class="empty-state">هنوز مهارتی اضافه نکردی.</p>';
      return;
    }

    container.innerHTML = skillsData.map((skill) => `
      <div class="skill-item" data-skill-id="${skill.id}">
        <span class="skill-item__name">${escapeHtml(skill.name)}</span>
        <input
          type="number"
          class="skill-item__input"
          value="${skill.percentage}"
          min="0"
          max="100"
          data-skill-id="${skill.id}"
          aria-label="درصد مهارت ${escapeHtml(skill.name)}"
        >
        <div class="skill-item__bar">
          <div class="skill-item__fill" style="width: ${skill.percentage}%"></div>
        </div>
      </div>
    `).join('');

    // Bind input change events
    container.querySelectorAll('.skill-item__input').forEach((input) => {
      input.addEventListener('change', () => updateSkill(input));
      input.addEventListener('blur', () => updateSkill(input));
    });
  }

  async function updateSkill(input) {
    const id = input.getAttribute('data-skill-id');
    let value = parseInt(input.value, 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(100, value));
    input.value = value;

    const result = await fetchAPI(`/api/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ percentage: value }),
    });

    if (result && result.success) {
      // Update local data
      const skill = skillsData.find((s) => s.id === id);
      if (skill) {
        skill.percentage = value;
      }

      // Update bar visual
      const skillItem = input.closest('.skill-item');
      const fill = skillItem.querySelector('.skill-item__fill');
      if (fill) {
        fill.style.width = value + '%';
      }

      showToast(`مهارت بروزرسانی شد → ${value}%`, 'success');
    }
  }

  // ============================================================
  // 7. MESSAGES (Contact Form Submissions)
  // ============================================================

  function renderMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;

    if (messagesData.length === 0) {
      container.innerHTML = '<p class="empty-state">هنوز پیامی دریافت نشده.</p>';
      return;
    }

    container.innerHTML = messagesData.map((msg) => `
      <div class="message-item ${msg.is_read ? 'message-item--read' : 'message-item--unread'}" data-message-id="${msg.id}">
        <div class="message-item__header">
          <div class="message-item__info">
            <span class="message-item__name">${escapeHtml(msg.name)}</span>
            <span class="message-item__email">${escapeHtml(msg.email)}</span>
            <span class="message-item__date">${formatDate(msg.created_at)}</span>
          </div>
          <div class="message-item__status">
            ${msg.is_read
              ? '<span class="badge badge--read">خوانده شده</span>'
              : '<span class="badge badge--unread">جدید</span>'
            }
          </div>
        </div>
        <div class="message-item__content">
          ${escapeHtml(msg.message)}
        </div>
        <div class="message-item__actions">
          ${!msg.is_read ? `
            <button class="btn btn--outline btn--sm btn--mark-read" data-id="${msg.id}">
              علامت به عنوان خوانده
            </button>
          ` : ''}
          <button class="btn btn--danger btn--sm btn--delete-message" data-id="${msg.id}">
            حذف
          </button>
        </div>
      </div>
    `).join('');

    // Bind action buttons
    container.querySelectorAll('.btn--mark-read').forEach((btn) => {
      btn.addEventListener('click', () => markMessageRead(btn.getAttribute('data-id')));
    });

    container.querySelectorAll('.btn--delete-message').forEach((btn) => {
      btn.addEventListener('click', () => deleteMessage(btn.getAttribute('data-id')));
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function markMessageRead(id) {
    const result = await fetchAPI(`/api/messages/${id}/read`, { method: 'PUT' });
    if (result && result.success) {
      showToast('پیام به عنوان خوانده علامت‌گذاری شد', 'success');
      loadMessages();
    }
  }

  async function deleteMessage(id) {
    if (!confirm('مطمئنی می‌خوای این پیام رو حذف کنی؟')) return;

    const result = await fetchAPI(`/api/messages/${id}`, { method: 'DELETE' });
    if (result && result.success) {
      showToast('پیام حذف شد', 'success');
      loadMessages();
    }
  }

  // ============================================================
  // 8. TOAST NOTIFICATIONS
  // ============================================================

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // ============================================================
  // 9. INIT
  // ============================================================

  function init() {
    // Check authentication
    checkAuth();

    // Initialize tabs
    initTabs();

    // Initialize project modal
    initProjectModal();

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;
        const globalError = document.getElementById('loginGlobalError');

        if (!username) {
          document.getElementById('loginUserError').textContent = 'نام کاربری الزامیه';
          return;
        }
        if (!password) {
          document.getElementById('loginPassError').textContent = 'رمز عبور الزامیه';
          return;
        }

        const success = await login(username, password);
        if (!success) {
          globalError.textContent = 'نام کاربری یا رمز عبور اشتباهه';
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
