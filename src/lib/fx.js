/**
 * Visual FX helpers: confetti burst + floating "+N XP" popup.
 * Imperative DOM FX — intentionally outside React's render tree.
 */

export function burst(x, y, count = 24) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors = ['#e63027', '#1f62e8', '#f2be00', '#14a05a'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.backgroundColor = color;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;

    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 110;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity - 25;
    const rot = (Math.random() - 0.5) * 540;

    fragment.appendChild(p);

    // Animate via Web Animations API
    const anim = p.animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0.6) rotate(${rot}deg)`, opacity: 0 },
      ],
      {
        duration: 850 + Math.random() * 200,
        easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => p.remove();
  }

  document.body.appendChild(fragment);
}

export function showFloatingXP(amount, originX, originY) {
  const el = document.createElement('div');
  el.className = 'floating-xp';
  el.textContent = `+${amount} XP`;

  if (typeof originX === 'number' && typeof originY === 'number') {
    const maxX = window.innerWidth - 90;
    const maxY = window.innerHeight - 80;
    el.style.left = `${Math.max(12, Math.min(originX - 35, maxX))}px`;
    el.style.top = `${Math.max(60, Math.min(originY - 30, maxY))}px`;
    el.style.right = 'auto';
  }

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}
