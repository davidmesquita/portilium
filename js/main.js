/* ── DARK MODE ── */
const dmBtn = document.getElementById('dm-toggle');
const saved = localStorage.getItem('dm');
if (saved === '1') {
  document.body.classList.add('dark');
  dmBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
}
dmBtn.onclick = () => {
  const on = document.body.classList.toggle('dark');
  dmBtn.innerHTML = on ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
  localStorage.setItem('dm', on ? '1' : '0');
};

/* ── WHATSAPP HOVER ── */
const wa = document.getElementById('whatsapp-btn');
wa.onmouseenter = () => {
  wa.style.transform = 'scale(1.1)';
  wa.style.boxShadow = '0 6px 28px rgba(37,211,102,.6)';
};
wa.onmouseleave = () => {
  wa.style.transform = '';
  wa.style.boxShadow = '0 4px 20px rgba(37,211,102,.45)';
};

/* ── SCROLL REVEAL ── */
const io = new IntersectionObserver(
  e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('in'); }),
  { threshold: 0.08 }
);
document.querySelectorAll('.r,.r2,.r3').forEach(el => io.observe(el));

/* ── CONTACT FORM ── */
function sendForm(e) {
  e.preventDefault();
  const b = e.target.querySelector('button');
  b.textContent = 'Mensagem enviada ✓';
  b.style.background = '#e6f6f1';
  b.style.color = '#00875A';
  setTimeout(() => {
    b.textContent = 'Enviar mensagem →';
    b.style.background = '';
    b.style.color = '';
    e.target.reset();
  }, 3500);
}
