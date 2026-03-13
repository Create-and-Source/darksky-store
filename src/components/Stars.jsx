import { useEffect, useRef } from 'react';

export default function Stars({ count = 200, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    let raf;
    let mouseX = 0, mouseY = 0;

    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.0003 + 0.0001,
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    let shooters = [];
    const addShooter = () => {
      shooters.push({ x: Math.random() * w, y: Math.random() * h * 0.5, vx: 4 + Math.random() * 6, vy: 2 + Math.random() * 3, len: 80 + Math.random() * 80, alpha: 1, life: 1 });
    };
    const shooterInterval = setInterval(() => { if (Math.random() < 0.6) addShooter(); }, 3500);

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
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / w - 0.5;
      mouseY = (e.clientY - rect.top) / h - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t++;

      stars.forEach(s => {
        s.twinkle += s.speed * 60;
        const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
        const px = (s.x + mouseX * -0.008) * w;
        const py = (s.y + mouseY * -0.008) * h;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${a})`;
        ctx.fill();
      });

      // Gold nebula glow
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.4);
      grd.addColorStop(0, 'rgba(201,169,74,0.04)');
      grd.addColorStop(1, 'rgba(201,169,74,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Shooting stars
      shooters = shooters.filter(s => s.alpha > 0);
      shooters.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.018;
        const g = ctx.createLinearGradient(s.x - s.vx * s.len / s.vx, s.y - s.vy * s.len / s.vx, s.x, s.y);
        g.addColorStop(0, `rgba(201,169,74,0)`);
        g.addColorStop(1, `rgba(255,248,220,${s.alpha})`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 14, s.y - s.vy * 14);
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
    };
  }, [count]);

  return <canvas ref={ref} className={`stars-canvas ${className}`} />;
}
