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

  /* =====================================================================
     MODE SOMBRE — tout est ici (couleurs + interrupteur), rien à ajouter
     dans le HTML ni dans style.css.
     Pour changer les couleurs du mode sombre : modifie les valeurs
     juste en dessous (--paper = fond, --card = cartes, --accent = couleur
     principale…).
     ===================================================================== */
  var DARK = {
    paper: '#0F161C', card: '#161F27', ink: '#E6ECF0', muted: '#9AA8B4',
    line: '#2A3641', accent: '#4FB3D1', accentSoft: '#17323C', track: '#33414D',
    header: 'rgba(15,22,28,.92)', code: '#0A0F14', onAccent: '#06212A'
  };

  var css = [
    ':root[data-theme="dark"]{--paper:' + DARK.paper + ';--card:' + DARK.card + ';--ink:' + DARK.ink +
      ';--muted:' + DARK.muted + ';--line:' + DARK.line + ';--accent:' + DARK.accent +
      ';--accent-soft:' + DARK.accentSoft + ';--track:' + DARK.track + ';--header-bg:' + DARK.header +
      ';--code-bg:' + DARK.code + ';--on-accent:' + DARK.onAccent + ';color-scheme:dark}',
    /* couleurs écrites « en dur » dans style.css : on les remplace en mode sombre */
    ':root[data-theme="dark"] header{background:' + DARK.header + '}',
    ':root[data-theme="dark"] .dots{background:linear-gradient(to right,var(--accent) calc(var(--lvl) * 20%),' + DARK.track + ' 0)}',
    ':root[data-theme="dark"] .code{background:' + DARK.code + '}',
    ':root[data-theme="dark"] .btn.primary{color:' + DARK.onAccent + '}',
    ':root[data-theme="dark"] .btn.primary .ripple{background:' + DARK.onAccent + '}',

    /* interrupteur soleil / lune */
    '.tools{display:flex;align-items:center;gap:.6rem}',
    '#theme{--h:36px;--w:64px;position:relative;box-sizing:border-box;flex:none;width:var(--w);height:var(--h);' +
      'margin:0;padding:0;border:1px solid var(--line);border-radius:999px;background:var(--card);cursor:pointer;' +
      'overflow:visible;transform:none;box-shadow:none;-webkit-tap-highlight-color:transparent;' +
      'transition:background-color .3s,border-color .2s}',
    '#theme:hover,#theme:active{border-color:var(--accent);transform:none;box-shadow:none}',
    '#theme:focus-visible{outline:3px solid var(--accent);outline-offset:3px}',
    ':root[data-theme="dark"] #theme{background:var(--accent-soft)}',
    '#theme .thumb{position:absolute;top:3px;left:3px;width:calc(var(--h) - 8px);height:calc(var(--h) - 8px);' +
      'border-radius:50%;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;' +
      'box-shadow:0 1px 4px rgba(0,0,0,.25);transition:transform .35s cubic-bezier(.3,1.35,.5,1)}',
    ':root[data-theme="dark"] #theme .thumb{transform:translateX(calc(var(--w) - var(--h)))}',
    '#theme .ico{display:grid;place-items:center}',
    '#theme.spin .ico{animation:theme-spin .5s ease}',
    '@keyframes theme-spin{from{transform:rotate(-180deg) scale(.4);opacity:0}to{transform:none;opacity:1}}',
    /* transition douce des couleurs au moment du changement */
    'html.theme-anim *{transition:background-color .35s,color .35s,border-color .35s,fill .35s,stroke .35s!important}',
    'html.theme-anim #theme .thumb{transition:transform .35s cubic-bezier(.3,1.35,.5,1),background-color .35s,color .35s!important}',
    '@media (max-width:760px){.tools{grid-area:lang}#theme{--h:40px;--w:72px}}',
    '@media (prefers-reduced-motion:reduce){#theme,#theme .thumb{transition:none}#theme.spin .ico{animation:none}' +
      'html.theme-anim *,html.theme-anim #theme .thumb{transition:none!important}}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'theme-css';
  style.textContent = css;
  document.head.appendChild(style);

  var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // l'interrupteur est créé ici, à côté du bouton de langue
  var tools = document.createElement('div');
  tools.className = 'tools';
  btn.parentNode.insertBefore(tools, btn);
  var tbtn = document.createElement('button');
  tbtn.id = 'theme';
  tbtn.type = 'button';
  tbtn.setAttribute('role', 'switch');
  tbtn.innerHTML = '<span class="thumb"><span class="ico"></span></span>';
  var ico = tbtn.querySelector('.ico');
  tools.appendChild(tbtn);
  tools.appendChild(btn);

  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  function updateThemeLabel() {
    var label = root.lang === 'fr' ? 'Mode sombre' : 'Dark mode';
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
    ico.innerHTML = t === 'dark' ? MOON : SUN;
    tbtn.setAttribute('aria-checked', t === 'dark' ? 'true' : 'false');
    meta.content = t === 'dark' ? DARK.paper : '#F6F7F5';
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
  document.querySelectorAll('.btn, .copy, #lang').forEach(function (el) {
    el.addEventListener('click', ripple);
  });

  /* ---------- Bouton « Copier l'adresse » ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      function done() {
        b.classList.add('copied');
        setTimeout(function () { b.classList.remove('copied'); }, 2000);
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        ta.remove();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  /* ---------- Schéma réseau : des paquets qui se promènent au hasard ----------
     Le script lit le dessin SVG (cercles = nœuds, lignes = liens) : si tu
     ajoutes un nœud ou un lien dans le SVG, les paquets l'empruntent aussi. */
  (function () {
    var svg = document.querySelector('.topo');
    var proto = svg && svg.querySelector('.packet');
    if (!proto) return;
    var NS = 'http://www.w3.org/2000/svg';
    var nodes = [].map.call(svg.querySelectorAll('circle.n, circle.hub'), function (c) {
      return { el: c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), r: +c.getAttribute('r'), nb: [] };
    });
    if (nodes.length < 2) return;

    function nearest(x, y) {
      var best = 0, d = Infinity;
      nodes.forEach(function (n, i) {
        var k = Math.hypot(n.x - x, n.y - y);
        if (k < d) { d = k; best = i; }
      });
      return best;
    }
    svg.querySelectorAll('line').forEach(function (l) {
      var a = nearest(+l.getAttribute('x1'), +l.getAttribute('y1'));
      var b = nearest(+l.getAttribute('x2'), +l.getAttribute('y2'));
      nodes[a].nb.push({ to: b, line: l });
      nodes[b].nb.push({ to: a, line: l });
    });
    var linked = [];
    nodes.forEach(function (n, i) { if (n.nb.length) linked.push(i); });
    if (!linked.length) return;

    function put(p, x, y) { p.el.setAttribute('cx', x); p.el.setAttribute('cy', y); }

    // mouvement réduit : un seul paquet immobile sur le nœud central
    if (reduce) {
      var hub = nodes.filter(function (n) { return n.el.classList.contains('hub'); })[0] || nodes[0];
      put({ el: proto }, hub.x, hub.y);
      proto.style.opacity = 1;
      return;
    }

    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function light(l, d) { l._n = (l._n || 0) + d; l.classList.toggle('lit', l._n > 0); }
    function ping(n) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'ping');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', n.r);
      svg.appendChild(c);
      c.addEventListener('animationend', function () { c.remove(); });
    }

    // un trajet = de 2 à 5 sauts d'un nœud à un voisin, sans faire demi-tour
    function begin(p) {
      p.from = pick(linked);
      p.prev = -1;
      p.hops = 2 + Math.floor(Math.random() * 4);
      put(p, nodes[p.from].x, nodes[p.from].y);
      p.el.style.opacity = 1;
      step(p);
    }
    function step(p) {
      var opts = nodes[p.from].nb.filter(function (e) { return e.to !== p.prev; });
      if (!opts.length) opts = nodes[p.from].nb;
      var e = pick(opts), a = nodes[p.from], b = nodes[e.to];
      p.to = e.to; p.line = e.line; p.t = 0;
      p.len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      p.speed = 60 + Math.random() * 80;
      light(p.line, 1);
    }

    var packets = [proto, proto.cloneNode(), proto.cloneNode()].map(function (el, i) {
      if (i) svg.appendChild(el);
      return { el: el, idle: true, wait: i * 600 };
    });

    var last = 0;
    function tick(now) {
      var dt = last ? Math.min(now - last, 60) / 1000 : 0;
      last = now;
      packets.forEach(function (p) {
        if (p.idle) {                            // en attente avant de (re)partir
          p.wait -= dt * 1000;
          if (p.wait > 0) return;
          p.idle = false;
          begin(p);
        }
        p.t += p.speed * dt / p.len;
        if (p.t >= 1) {
          light(p.line, -1);
          ping(nodes[p.to]);
          p.prev = p.from; p.from = p.to; p.hops--;
          if (p.hops <= 0) {                     // trajet fini : le paquet disparaît puis repart ailleurs
            p.el.style.opacity = 0;
            p.idle = true;
            p.wait = 700 + Math.random() * 1800;
            return;
          }
          step(p);
        }
        var a = nodes[p.from], b = nodes[p.to];
        var k = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(p.t, 1));
        put(p, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- Année du pied de page ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
