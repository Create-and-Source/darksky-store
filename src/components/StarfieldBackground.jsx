import { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, raf;
    let mouseX = 0, mouseY = 0;
    let hidden = false;

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.0004 + 0.00015,
      phase: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    let shooters = [];
    let lastShooter = 0;
    const shootInterval = () => 8000 + Math.random() * 4000; // 8-12s
    let nextShoot = shootInterval();

    const addShooter = () => {
      shooters.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.4,
        vx: 5 + Math.random() * 5,
        vy: 2 + Math.random() * 3,
        alpha: 1,
        trail: [],
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      mouseX = e.clientX / w - 0.5;
      mouseY = e.clientY / h - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    const onVisibility = () => { hidden = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    let elapsed = 0;
    let lastTime = performance.now();

    const draw = (now) => {
      if (hidden) { raf = requestAnimationFrame(draw); return; }

      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#04040c');
      bg.addColorStop(0.5, '#080818');
      bg.addColorStop(1, '#0a0a14');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle nebula
      const neb = ctx.createRadialGradient(w * 0.7, h * 0.25, 0, w * 0.7, h * 0.25, w * 0.35);
      neb.addColorStop(0, 'rgba(212,175,55,0.025)');
      neb.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);

      // Stars with parallax
      const px = mouseX * -0.012;
      const py = mouseY * -0.012;

      stars.forEach(s => {
        s.phase += s.speed * dt;
        const twinkle = 0.6 + 0.4 * Math.sin(s.phase);
        const a = s.alpha * twinkle;
        const sx = (s.x + px * s.r) * w;
        const sy = (s.y + py * s.r) * h;

        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${a})`;
        ctx.fill();

        // Bright stars get a soft glow
        if (s.r > 1.2 && a > 0.5) {
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${a * 0.08})`;
          ctx.fill();
        }
      });

      // Shooting stars
      lastShooter += dt;
      if (lastShooter > nextShoot) {
        addShooter();
        lastShooter = 0;
        nextShoot = shootInterval();
      }

      shooters = shooters.filter(s => s.alpha > 0);
      shooters.forEach(s => {
        s.trail.push({ x: s.x, y: s.y, a: s.alpha });
        if (s.trail.length > 20) s.trail.shift();
        s.x += s.vx * dt * 0.06;
        s.y += s.vy * dt * 0.06;
        s.alpha -= 0.008 * dt * 0.06;

        // Gold trail
        for (let i = 1; i < s.trail.length; i++) {
          const t0 = s.trail[i - 1];
          const t1 = s.trail[i];
          const progress = i / s.trail.length;
          ctx.beginPath();
          ctx.moveTo(t0.x, t0.y);
          ctx.lineTo(t1.x, t1.y);
          ctx.strokeStyle = `rgba(212,175,55,${progress * s.alpha * 0.6})`;
          ctx.lineWidth = 1.5 * progress;
          ctx.stroke();
        }

        // Head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${s.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
