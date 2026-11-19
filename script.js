(function () {
  var root = document.documentElement;
  var btn = document.getElementById('lang');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Bouton de langue ---------- */
  function setButtonText(l) {
    var t = l === 'fr' ? 'FR' : 'EN';
    if (btn.firstChild && btn.firstChild.nodeType === 3) btn.firstChild.nodeValue = t;
    else btn.textContent = t;
  }

  // relance une animation CSS en retirant puis remettant sa classe
  function play(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function setLang(l, animate) {
    root.lang = l;
    document.title = l === 'fr' ? root.dataset.titleFr : root.dataset.titleEn;
    btn.setAttribute('aria-label', l === 'fr' ? 'Switch to English' : 'Passer en français');
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
  document.querySelectorAll('.btn, #lang').forEach(function (el) {
    el.addEventListener('click', ripple);
  });

  /* ---------- Année du pied de page ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();