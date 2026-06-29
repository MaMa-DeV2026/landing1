/*
 * Resume Download Handler
 * Handles resume PDF with fallback options
 */

function initResumeDownload() {
  const resumeBtn = document.getElementById('resumeDownload');
  if (!resumeBtn) return;

  // Fallback URLs (in order of preference)
  const fallbackUrls = [
    '/assets/mamad_dev-resume.pdf',
    'https://drive.google.com/uc?export=download&id=YOUR_GOOGLE_DRIVE_FILE_ID'
  ];

  // Check if resume exists, enable/disable accordingly
  checkResumeAvailability(resumeBtn, fallbackUrls);
}

async function checkResumeAvailability(btn, urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        btn.href = url;
        btn.removeAttribute('disabled');
        return;
      }
    } catch {
      // Try next URL
      continue;
    }
  }

  // No resume found - show warning but allow click
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    showResumeUnavailable();
  });
}

function showResumeUnavailable() {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'toast toast--warning';
  toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>رزومه به زودی اضافه می‌شود</span>';

  document.body.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('toast--show');
  }, 100);

  setTimeout(function() {
    toast.classList.remove('toast--show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}
