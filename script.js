(function () {
  var root = document.documentElement;
  var btn = document.getElementById('lang');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // relance une animation CSS en retirant puis remettant sa classe
  function play(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------- Mode sombre ---------- */
  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  // le bouton est créé ici : pas besoin de le mettre dans le HTML
  var tools = document.createElement('div');
  tools.className = 'tools';
  btn.parentNode.insertBefore(tools, btn);
  var tbtn = document.createElement('button');
  tbtn.id = 'theme';
  tbtn.type = 'button';
  tbtn.innerHTML = '<span class="ico"></span>';
  var ico = tbtn.firstChild;
  tools.appendChild(tbtn);
  tools.appendChild(btn);

  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  function updateThemeLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    var fr = root.lang === 'fr';
    var label = dark ? (fr ? 'Activer le mode clair' : 'Switch to light mode')
                     : (fr ? 'Activer le mode sombre' : 'Switch to dark mode');
    tbtn.setAttribute('aria-label', label);
    tbtn.title = label;
  }

  function applyTheme(t, animate) {
    if (animate && !reduce) {
      root.classList.add('theme-anim');
      setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
      play(tbtn, 'spin');
    }
    root.setAttribute('data-theme', t);
    ico.innerHTML = t === 'dark' ? SUN : MOON;
    meta.content = t === 'dark' ? '#0F161C' : '#F6F7F5';
    updateThemeLabel();
  }

  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (mq && mq.matches ? 'dark' : 'light'), false);

  tbtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(t, true);
    try { localStorage.setItem('theme', t); } catch (e) {}
    savedTheme = t;
  });

  // tant que tu n'as pas choisi toi-même, le site suit le réglage de l'appareil
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (!savedTheme) applyTheme(e.matches ? 'dark' : 'light', false);
    });
  }

  /* ---------- Bouton de langue ---------- */
  function setButtonText(l) {
    var t = l === 'fr' ? 'FR' : 'EN';
    if (btn.firstChild && btn.firstChild.nodeType === 3) btn.firstChild.nodeValue = t;
    else btn.textContent = t;
  }

  function setLang(l, animate) {
    root.lang = l;
    document.title = l === 'fr' ? root.dataset.titleFr : root.dataset.titleEn;
    btn.setAttribute('aria-label', l === 'fr' ? 'Switch to English' : 'Passer en français');
    updateThemeLabel();
    try { localStorage.setItem('lang', l); } catch (e) {}

    if (animate && !reduce) {
      play(btn, 'flip');                       // le bouton se retourne…
      play(document.body, 'swap');             // …et le texte de la page apparaît en fondu
      setTimeout(function () { setButtonText(l); }, 150);  // le texte change à mi-retournement
    } else {
      setButtonText(l);
    }
  }

  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'fr', false);

  btn.addEventListener('click', function () {
    setLang(root.lang === 'fr' ? 'en' : 'fr', true);
  });

  /* ---------- Effet « vague » au clic sur les boutons ---------- */
  function ripple(e) {
    if (reduce) return;
    var el = e.currentTarget;
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2;
    // e.detail === 0 : clic au clavier, la vague part du centre
    var x = e.detail === 0 ? r.width / 2 : e.clientX - r.left;
    var y = e.detail === 0 ? r.height / 2 : e.clientY - r.top;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (x - size / 2) + 'px';
    s.style.top = (y - size / 2) + 'px';
    el.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  }

  // pour ajouter l'effet à d'autres éléments, ajoute leur sélecteur ici
  document.querySelectorAll('.btn, #lang, #theme').forEach(function (el) {
    el.addEventListener('click', ripple);
  });

  /* ---------- Année du pied de page ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
