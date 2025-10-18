(function(){
  // 元素选择（若类名不同，可调整选择器）
  const homeBtn = document.querySelector('nav .bar .fa-home[role="button"]');
  const topBtn  = document.querySelector('nav .bar .fa-top[role="button"]');
  const adjBtn  = document.querySelector('nav .bar .fa-adjust[role="button"]');

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
      // 优先使用 data-home 指定的目标（如果你想配置不同的首页）
      const nav = homeBtn.closest('nav');
      const custom = nav && nav.getAttribute('data-home');
      const dest = custom || '/';
      // 对于单页应用（SPA）你可能想使用 router，这里使用 location.href 做通用跳转
      window.location.href = dest;
    });
  }

  // --------- TOP: 平滑滚动到顶部（考虑 prefers-reduced-motion） ----------
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

  // --------- ADJUST: 切换“反色”主题，并记忆到 localStorage ----------
  const INVERT_KEY = 'site:inverted';

  function applyInvertedState(on) {
    if (on) {
      document.documentElement.classList.add('inverted');
      adjBtn && adjBtn.setAttribute('aria-pressed', 'true');
    } else {
      document.documentElement.classList.remove('inverted');
      adjBtn && adjBtn.setAttribute('aria-pressed', 'false');
    }
  }

  if (adjBtn) {
    // 初始化 aria-pressed，如果不存在则设置
    if (!adjBtn.hasAttribute('aria-pressed')) adjBtn.setAttribute('aria-pressed', 'false');
    bindKeyboardActivation(adjBtn);

    // 恢复上次状态
    try {
      const last = localStorage.getItem(INVERT_KEY);
      if (last === '1') applyInvertedState(true);
    } catch (e) { /* ignore storage errors */ }

    adjBtn.addEventListener('click', (e) => {
      // 切换
      const isOn = adjBtn.getAttribute('aria-pressed') === 'true';
      applyInvertedState(!isOn);
      try {
        localStorage.setItem(INVERT_KEY, !isOn ? '1' : '0');
      } catch (err) {
        // localStorage 失败不影响功能
      }
    });
  }

  // 可选：按 Esc 关闭 tooltip 或收起（如果你加了 tooltip 脚本）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 这里目前没有 tooltip 全局状态需要处理；保留占位以便未来扩展
    }
  });
})();