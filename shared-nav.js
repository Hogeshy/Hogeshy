(() => {
  const nav = document.querySelector('.site-nav, .global-nav');
  if (!nav) return;

  const links = [
    ['ホーム', 'index.html'],
    ['Hogeshyとは', 'what-is-hogeshy.html'],
    ['無料コンテンツ', 'free.html'],
    ['メルマガ', 'newsletter.html'],
    ['ショップ', 'shop.html'],
    ['作者', 'artist.html'],
    ['実績', 'portfolio.html'],
    ['お問い合わせ', 'contact.html'],
    ['Instagram', 'https://www.instagram.com/hogeshy_ai/', 'external'],
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const menu = links.map(([label, href, kind]) => {
    const external = kind === 'external' ? ' target="_blank" rel="noopener"' : '';
    const active = href === current ? ' aria-current="page"' : '';
    return `<a href="${href}"${external}${active}>${label}</a>`;
  }).join('') + `<button class="language-link translate-button" type="button" aria-label="ページを英語に自動翻訳">English（自動翻訳）</button>`;

  nav.className = 'site-nav';
  nav.setAttribute('aria-label', '主要メニュー');
  nav.innerHTML = `<a class="site-brand" href="index.html" aria-label="ホゲシーのホーム">HOGESHY</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="hogeshy-primary-links"><span aria-hidden="true">☰</span> メニュー</button>
    <div class="nav-links" id="hogeshy-primary-links">${menu}</div>`;

  const translateButton = nav.querySelector('.translate-button');
  const loadTranslator = () => {
    if (window.google && window.google.translate) return Promise.resolve();
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({pageLanguage: 'ja', includedLanguages: 'en', autoDisplay: false}, 'google_translate_element');
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
    return new Promise((resolve) => setTimeout(resolve, 900));
  };
  const translateToEnglish = async () => {
    if (!document.getElementById('google_translate_element')) {
      const holder = document.createElement('div');
      holder.id = 'google_translate_element';
      holder.style.display = 'none';
      document.body.appendChild(holder);
    }
    await loadTranslator();
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }
    }, 700);
  };
  translateButton.addEventListener('click', translateToEnglish);

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
