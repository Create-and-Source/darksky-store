import { useState, useEffect } from 'react';

const S = {
  banner: {
    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: 14, padding: '14px 20px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
    zIndex: 9999, maxWidth: 'calc(100vw - 32px)',
    animation: 'slideUp 0.3s ease',
  },
  icon: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  text: {
    font: "500 14px -apple-system, sans-serif", color: '#F0EDE6',
    margin: 0,
  },
  sub: {
    font: "400 12px -apple-system, sans-serif", color: 'rgba(240,237,230,0.6)',
    margin: '2px 0 0',
  },
  install: {
    background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
    border: 'none', borderRadius: 8, padding: '8px 16px',
    font: "600 13px -apple-system, sans-serif", color: '#FFFFFF',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
  dismiss: {
    background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)',
    cursor: 'pointer', fontSize: 18, padding: 4, lineHeight: 1,
  },
};

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem('ds_pwa_dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('ds_pwa_dismissed', 'true');
  };

  return (
    <div style={S.banner}>
      <div style={S.icon}>&#10022;</div>
      <div>
        <p style={S.text}>Install Dark Sky App</p>
        <p style={S.sub}>Quick access from your home screen</p>
      </div>
      <button style={S.install} onClick={handleInstall}>Install</button>
      <button style={S.dismiss} onClick={handleDismiss}>&times;</button>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
