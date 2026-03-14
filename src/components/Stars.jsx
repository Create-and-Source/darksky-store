import { useEffect, useRef } from 'react';

export default function Stars({ count = 200, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, raf;
    let mouseX = 0, mouseY = 0;
    let visible = true;

    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.0003 + 0.0001,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let shooters = [];
    const addShooter = () => {
      shooters.push({
        x: Math.random() * 0.7 * (w || 1),
        y: Math.random() * 0.4 * (h || 1),
        vx: 5 + Math.random() * 7,
        vy: 2 + Math.random() * 4,
        alpha: 1,
      });
    };
    const shooterInterval = setInterval(() => {
      if (visible && Math.random() < 0.5) addShooter();
    }, 6000);

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const draw = () => {
      if (!visible) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      // Stars
      stars.forEach(s => {
        s.twinkle += s.speed * 60;
        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
        const px = (s.x + mouseX * -0.006) * w;
        const py = (s.y + mouseY * -0.006) * h;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${a})`;
        ctx.fill();
      });

      // Subtle gold nebula glow
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.35);
      grd.addColorStop(0, 'rgba(212,175,55,0.02)');
      grd.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Shooting stars
      shooters = shooters.filter(s => s.alpha > 0);
      shooters.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.015;
        const tailLen = 18;
        const g = ctx.createLinearGradient(
          s.x - s.vx * tailLen, s.y - s.vy * tailLen, s.x, s.y
        );
        g.addColorStop(0, 'rgba(212,175,55,0)');
        g.addColorStop(0.6, `rgba(212,175,55,${s.alpha * 0.4})`);
        g.addColorStop(1, `rgba(255,248,220,${s.alpha})`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * tailLen, s.y - s.vy * tailLen);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(shooterInterval);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count]);

  return <canvas ref={ref} className={`stars-canvas ${className}`} />;
}
