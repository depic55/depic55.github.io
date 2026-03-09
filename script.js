document.querySelectorAll('.nav-box').forEach(box => {

  // 📱 rebond au clic (mobile)
  box.addEventListener('touchstart', () => {
    box.classList.remove('bounce');
    void box.offsetWidth; // reset animation
    box.classList.add('bounce');
  });

});