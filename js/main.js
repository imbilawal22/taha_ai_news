/**
 * =========================================================================
 * TAHA AI NEWS - MAIN LOGIC
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDateDisplay();
  initNewsRenderer();
  initModal();
  initNewsletter();
});

/* -------------------------------------------------------------------------
   1. Theme Toggle (Dark / Light Mode)
   ------------------------------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  if (!sunIcon || !moonIcon) return;

  if (theme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

/* -------------------------------------------------------------------------
   2. Live Date Display
   ------------------------------------------------------------------------- */
function initDateDisplay() {
  const dateElement = document.getElementById('currentDate');
  if (!dateElement) return;

  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('en-US', options);
}

/* -------------------------------------------------------------------------
   3. News Rendering & Filtering
   ------------------------------------------------------------------------- */
let currentFilter = 'all';
let searchQuery = '';

function getAllNews() {
  // Combines static news-data.js with any newly added news in localStorage
  const savedNews = JSON.parse(localStorage.getItem('taha_custom_news') || '[]');
  const combined = [...savedNews, ...(typeof aiNewsList !== 'undefined' ? aiNewsList : [])];
  return combined;
}

function initNewsRenderer() {
  renderNews();

  // Category filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-category');
      renderNews();
    });
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderNews();
    });
  }
}

function renderNews() {
  const container = document.getElementById('newsContainer');
  if (!container) return;

  const allNews = getAllNews();
  
  // Filter news
  const filtered = allNews.filter(item => {
    const matchesCategory = currentFilter === 'all' || item.category === currentFilter;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery) || 
      (item.summary && item.summary.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // If there are no news items at all (as requested)
  if (allNews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
        </div>
        <h3>No AI News Published Yet</h3>
        <p>Aapki website bilkul ready hai! Daily AI updates, breaking tech news aur AI tools ki updates yahan display hongi.</p>
        <div class="empty-actions">
          <button class="btn-primary" onclick="openPostModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Post Daily News
          </button>
          <a href="#newsletter" class="btn-secondary">Subscribe for Alerts</a>
        </div>
      </div>
    `;
    return;
  }

  // If there are news, but search/filter returned 0 results
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3>No matching AI news found</h3>
        <p>Try searching for different keywords or reset category filters.</p>
        <button class="btn-secondary" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  // Render news cards
  container.innerHTML = filtered.map(item => `
    <article class="news-card">
      <div>
        <div class="news-card-meta">
          <span class="card-tag">${escapeHtml(item.categoryLabel || item.category)}</span>
          <span class="card-date">${escapeHtml(item.date || 'Today')}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || '')}</p>
      </div>
      <div class="news-card-footer">
        <span>${escapeHtml(item.readTime || '2 min read')}</span>
        <a href="${item.url || '#'}" target="${item.url && item.url.startsWith('http') ? '_blank' : '_self'}" class="read-more-link">
          Read More 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `).join('');
}

function resetFilters() {
  currentFilter = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(c => {
    if (c.getAttribute('data-category') === 'all') c.classList.add('active');
    else c.classList.remove('active');
  });
  renderNews();
}

/* -------------------------------------------------------------------------
   4. Post News Modal (Friendly Helper to post AI news)
   ------------------------------------------------------------------------- */
function initModal() {
  const modal = document.getElementById('postModal');
  const postBtn = document.getElementById('openPostBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('postNewsForm');

  if (postBtn) {
    postBtn.addEventListener('click', openPostModal);
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newsTitle').value.trim();
      const category = document.getElementById('newsCategory').value;
      const categoryLabel = document.getElementById('newsCategory').options[document.getElementById('newsCategory').selectedIndex].text;
      const summary = document.getElementById('newsSummary').value.trim();
      const sourceUrl = document.getElementById('newsUrl').value.trim() || '#';
      const readTime = document.getElementById('newsReadTime').value.trim() || '2 min read';

      if (!title || !summary) {
        showToast('Please fill in title and summary');
        return;
      }

      const newPost = {
        id: Date.now(),
        title,
        category,
        categoryLabel,
        summary,
        url: sourceUrl,
        readTime,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // Save to localStorage for instant view
      const currentSaved = JSON.parse(localStorage.getItem('taha_custom_news') || '[]');
      currentSaved.unshift(newPost);
      localStorage.setItem('taha_custom_news', JSON.stringify(currentSaved));

      form.reset();
      modal.classList.remove('active');
      renderNews();
      showToast('News published successfully!');
    });
  }
}

function openPostModal() {
  const modal = document.getElementById('postModal');
  if (modal) modal.classList.add('active');
}

/* -------------------------------------------------------------------------
   5. Newsletter & Utilities
   ------------------------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (email) {
        showToast('Subscribed! You will receive daily AI updates.');
        form.reset();
      }
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
