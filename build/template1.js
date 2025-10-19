(function(){
  // 元素选择（若类名不同，可调整选择器）
  const homeBtn = document.querySelector('nav .bar .fa-home[role="button"]');
  const topBtn  = document.querySelector('nav .bar .fa-top[role="button"]');
  const themeBtn = document.querySelector('nav .bar .fa-adjust[role="button"]'); // 原 adjBtn

  // 帮助函数 - 键盘激活 (Enter / Space)
  function bindKeyboardActivation(el) {
    if (!el) return;
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        el.click();
      }
    });
  }

  // --------- HOME: 跳到首页（可按需改为具体 URL） ---------
  if (homeBtn) {
    bindKeyboardActivation(homeBtn);
    homeBtn.addEventListener('click', () => {
      const nav = homeBtn.closest('nav');
      const custom = nav && nav.getAttribute('data-home');
      const dest = custom || '/';
      window.location.href = dest;
    });
  }

  // --------- TOP: 平滑滚动到顶部 ----------
  if (topBtn) {
    bindKeyboardActivation(topBtn);
    topBtn.addEventListener('click', () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // --------- THEME: 切换夜间模式（CSS变量） ----------
  const THEME_KEY = 'site:nightMode';

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('inverted');
      themeBtn && themeBtn.setAttribute('aria-pressed', 'true');
    } else {
      document.documentElement.classList.remove('inverted');
      themeBtn && themeBtn.setAttribute('aria-pressed', 'false');
    }
  }

  if (themeBtn) {
    // 初始化 aria-pressed
    if (!themeBtn.hasAttribute('aria-pressed')) themeBtn.setAttribute('aria-pressed', 'false');
    bindKeyboardActivation(themeBtn);

    // 恢复上次状态
    try {
      const last = localStorage.getItem(THEME_KEY);
      if (last === '1') applyTheme(true);
    } catch (e) { /* ignore storage errors */ }

    themeBtn.addEventListener('click', () => {
      const isOn = themeBtn.getAttribute('aria-pressed') === 'true';
      applyTheme(!isOn);
      try {
        localStorage.setItem(THEME_KEY, !isOn ? '1' : '0');
      } catch (err) { /* ignore */ }
    });
  }

  // 可选：按 Esc 关闭 tooltip 或收起
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 占位以便未来扩展
    }
  });
})();


/* ------------------ BEGIN: show .toc only when page is at top (modern, standards-first) ------------------
   Behavior:
   - When viewport width <= 900px, nav gets a 'page-top' class only if the page is scrolled to the very top (scrollY <= 0).
   - Uses mql.addEventListener('change', ...) when available, falls back to mql.addListener(...), and finally to a debounced resize fallback.
   - Ensures idempotence and performs cleanup on unload to avoid leaks (MutationObserver, listeners).
---------------------------------------------------------------------------------------------- */
(function(){
  const MQL_QUERY = '(max-width:900px)';
  const mql = window.matchMedia(MQL_QUERY);

  // Stateful handles so we can remove listeners on unload
  let resizeFallback = null;
  let mqlChangeHandler = null;
  let domObserver = null;

  function setupNavPageTop(){
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Avoid duplicate initialization
    if (nav.__pageTopInitialized) return;
    nav.__pageTopInitialized = true;

    // Core updater: add/remove .page-top based on being scrolled to the absolute top
    function updateNavClass() {
      const atTop = (window.pageYOffset || document.documentElement.scrollTop || 0) <= 0;
      if (atTop) nav.classList.add('page-top');
      else nav.classList.remove('page-top');
    }

    // Enable/disable functions that attach/detach scroll/resize listeners used while the
    // media-query condition is active (i.e., small screens).
    function enable() {
      updateNavClass();
      document.addEventListener('scroll', updateNavClass, { passive: true });
      window.addEventListener('resize', updateNavClass);
    }

    function disable() {
      nav.classList.remove('page-top');
      document.removeEventListener('scroll', updateNavClass);
      window.removeEventListener('resize', updateNavClass);
    }

    // Handler used for MediaQueryList "change" events
    mqlChangeHandler = function(e) {
      if (e && typeof e.matches === 'boolean') {
        if (e.matches) enable(); else disable();
      } else {
        // Defensive: if called without event, just check current matches
        if (mql.matches) enable(); else disable();
      }
    };

    // Prefer modern addEventListener API; fallback to addListener for older browsers;
    // if neither exists, use a debounced resize listener as a last resort.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', mqlChangeHandler);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(mqlChangeHandler);
    } else {
      // Debounced resize fallback: only run logic when matches actually changes
      let prevMatches = mql.matches;
      resizeFallback = function() {
        // Re-evaluate via new matchMedia because some browsers update matches only on re-query
        const curMatches = window.matchMedia(MQL_QUERY).matches;
        if (curMatches !== prevMatches) {
          prevMatches = curMatches;
          if (curMatches) enable(); else disable();
        }
      };
      window.addEventListener('resize', resizeFallback);
    }

    // Initial activation depending on current viewport
    if (mql.matches) enable();

    // Observe DOM changes (SPA / hydration) and re-check nav state when DOM mutates
    domObserver = new MutationObserver(function() {
      updateNavClass();
    });
    domObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });

    // Keep the class synced after DOMContentLoaded (safe-guard)
    document.addEventListener('DOMContentLoaded', updateNavClass);
    // Immediately run once in case DOMContentLoaded already fired
    updateNavClass();

    // Cleanup on page unload to avoid leaks
    window.addEventListener('beforeunload', function cleanup() {
      try {
        if (domObserver) { domObserver.disconnect(); domObserver = null; }
        if (typeof mql.removeEventListener === 'function' && mqlChangeHandler) {
          mql.removeEventListener('change', mqlChangeHandler);
        } else if (typeof mql.removeListener === 'function' && mqlChangeHandler) {
          mql.removeListener(mqlChangeHandler);
        }
        if (resizeFallback) {
          window.removeEventListener('resize', resizeFallback);
          resizeFallback = null;
        }
        // remove other listeners
        document.removeEventListener('scroll', updateNavClass);
        window.removeEventListener('resize', updateNavClass);
      } catch (err) {
        // swallow errors during unload
      }
    }, { once: true });
  }

  // Initialize when DOM is ready (or immediately if already ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNavPageTop);
  } else {
    setupNavPageTop();
  }
})();
 /* ------------------ END: show .toc only when page is at top (modern, standards-first) ------------------ */