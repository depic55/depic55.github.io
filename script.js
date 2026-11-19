(function () {
  var root = document.documentElement;
  var btn = document.getElementById('lang');

  function setLang(l) {
    root.lang = l;
    document.title = l === 'fr' ? root.dataset.titleFr : root.dataset.titleEn;
    btn.textContent = l === 'fr' ? 'FR' : 'EN';
    btn.setAttribute('aria-label', l === 'fr' ? 'Switch to English' : 'Passer en français');
    try { localStorage.setItem('lang', l); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'fr');

  btn.addEventListener('click', function () {
    setLang(root.lang === 'fr' ? 'en' : 'fr');
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
