(() => {
  const nav = document.querySelector('.site-nav, .global-nav');
  if (!nav) return;

  const links = [
    ['ホーム', 'index.html'],
    ['Hogeshyとは', 'what-is-hogeshy.html'],
    ['物語', 'story.html'],
    ['日記', 'diaryarchive.html'],
    ['無料', 'free.html'],
    ['お知らせ', 'newsletter.html'],
    ['ショップ', 'shop.html'],
    ['作者', 'artist.html'],
    ['お問い合わせ', 'contact.html'],
    ['Instagram', 'https://www.instagram.com/hogeshy_ai/', 'external'],
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const menu = links.map(([label, href, kind]) => {
    const external = kind === 'external' ? ' target="_blank" rel="noopener"' : '';
    const active = href === current ? ' aria-current="page"' : '';
    return `<a href="${href}"${external}${active}>${label}</a>`;
  }).join('');

  nav.className = 'site-nav';
  nav.setAttribute('aria-label', '主要メニュー');
  nav.innerHTML = `<a class="site-brand" href="index.html" aria-label="ホゲシーのホーム">HOGESHY</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="hogeshy-primary-links"><span aria-hidden="true">☰</span> メニュー</button>
    <div class="nav-links" id="hogeshy-primary-links">${menu}</div>`;

  const toggle = nav.querySelector('.nav-toggle');
  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
})();
