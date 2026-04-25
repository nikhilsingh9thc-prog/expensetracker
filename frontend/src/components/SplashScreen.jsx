import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const LOADING_MESSAGES = [
  'INITIALIZING SYSTEM...',
  'LOADING ASSETS...',
  'CONNECTING TO SERVER...',
  'SYNCING YOUR DATA...',
  'ALMOST READY...',
];

export default function SplashScreen({ onComplete }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible,  setVisible]  = useState(true);

  useEffect(() => {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 18 + 4;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 600);
        }, 400);
      }
      setProgress(Math.min(pct, 100));
      setMsgIndex(Math.floor((Math.min(pct, 99) / 100) * LOADING_MESSAGES.length));
    }, 280);
    return () => clearInterval(interval);
  }, [onComplete]);

  /* Theme-aware inline colours */
  const accent  = theme?.splashAccent   || '#EC4899';
  const barGrad = theme?.splashGradient || `linear-gradient(90deg,${accent},#fff,${accent})`;
  const blobL   = theme?.splashBlobLeft  || 'radial-gradient(circle,#8b1a5e,#3d0028 50%,transparent 70%)';
  const blobR   = theme?.splashBlobRight || 'radial-gradient(circle,#0d5c52,#032e28 50%,transparent 70%)';

  return (
    <div className={`splash-screen ${!visible ? 'splash-exit' : ''}`}>
      {/* Dot grid */}
      <div className="splash-grid" />

      {/* Ambient blobs — theme-colored */}
      <div className="splash-blob splash-blob-left"  style={{ background: blobL }} />
      <div className="splash-blob splash-blob-right" style={{ background: blobR }} />

      {/* Center content */}
      <div className="splash-content">

        {/* Edition badge — "NIKHIL SINGH" */}
        <div className="splash-edition" style={{ color: accent }}>
          ✦ &nbsp;NIKHIL SINGH
        </div>

        {/* Logo */}
        <div className="splash-logo">
          <span className="splash-logo-main">PAISE</span>
          <span className="splash-logo-accent" style={{
            background: `linear-gradient(135deg, ${accent}, #ffffff80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}> KAHA</span>
        </div>

        {/* Tagline */}
        <div className="splash-tagline" style={{ color: accent }}>
          MONEY MANAGEMENT
        </div>

        {/* Progress bar */}
        <div className="splash-loader">
          <div className="splash-loader-bar-track">
            <div
              className="splash-loader-bar-fill"
              style={{
                width: `${progress}%`,
                background: barGrad,
                backgroundSize: '200% 100%',
              }}
            />
          </div>
          <div className="splash-loader-text">
            <span className="splash-loader-msg">{LOADING_MESSAGES[msgIndex] || 'READY'}</span>
            <span className="splash-loader-pct">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
