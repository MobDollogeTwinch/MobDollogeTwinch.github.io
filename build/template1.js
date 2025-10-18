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
