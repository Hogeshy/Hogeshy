(() => {
  const nav = document.querySelector('.site-nav, .global-nav');
  if (!nav) return;

  const links = [
    ['START', 'index.html'],
    ['STORY', 'story.html'],
    ['ORIGIN', 'what-is-hogeshy.html'],
    ['DIARY', 'diaryarchive.html'],
    ['FREE', 'free.html'],
    ['NOTES', 'newsletter.html'],
    ['SHOP', 'shop.html'],
    ['INSTAGRAM', 'https://www.instagram.com/hogeshy_ai/', 'external'],
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const menu = links.map(([label, href, kind]) => {
    const external = kind === 'external' ? ' target="_blank" rel="noopener"' : '';
    const active = href === current ? ' aria-current="page"' : '';
    return `<a href="${href}"${external}${active}>${label}</a>`;
  }).join('');

  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.innerHTML = `<a class="site-brand" href="index.html" aria-label="Hogeshy home">HOGESHY</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="hogeshy-primary-links"><span aria-hidden="true">☰</span> MENU</button>
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
