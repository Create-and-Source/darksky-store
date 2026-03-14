import { useState, useEffect } from 'react';

const S = {
  banner: {
    position: 'fixed', top: 0, left: 0, right: 0,
    background: '#F59E0B', color: '#FFFFFF',
    font: "500 13px -apple-system, sans-serif",
    textAlign: 'center', padding: '6px 16px',
    zIndex: 99999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#FFFFFF', opacity: 0.8,
    animation: 'offlinePulse 1.5s ease infinite',
  },
};

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOff = () => setOffline(true);
    const goOn = () => setOffline(false);
    window.addEventListener('offline', goOff);
    window.addEventListener('online', goOn);
    return () => {
      window.removeEventListener('offline', goOff);
      window.removeEventListener('online', goOn);
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={S.banner}>
      <span style={S.dot} />
      You're offline — some features may be limited
      <style>{`@keyframes offlinePulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }`}</style>
    </div>
  );
}
