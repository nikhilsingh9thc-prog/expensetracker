import { createContext, useContext, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════
   3 PAGE THEMES — rotate on every page refresh
   ═══════════════════════════════════════════════ */

export const PAGE_THEMES = [
  {
    id:       'forest',
    label:    'Forest Leaf',
    accent:   '#22C55E',
    gradient: 'linear-gradient(135deg, #064e1a 0%, #16a34a 50%, #22C55E 100%)',
    glow:     'rgba(34,197,94,0.38)',
    shadow:   'rgba(34,197,94,0.45)',
    border:   'rgba(34,197,94,0.25)',
    /* Splash */
    splashAccent:    '#22C55E',
    splashGradient:  'linear-gradient(90deg,#22C55E,#4ade80,#22C55E)',
    splashBlobLeft:  'radial-gradient(circle,#052e16 0%,#064e1a 50%,transparent 70%)',
    splashBlobRight: 'radial-gradient(circle,#0d1f0d 0%,#000 50%,transparent 70%)',
    /* Hero */
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(22,163,74,0.42) 0%, transparent 70%), linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.10) 40%,rgba(0,0,0,0.72) 100%)',
    heroTitleColor: '#22C55E',
    heroCursorColor:'#22C55E',
    /* Nav active pill */
    navActive: 'linear-gradient(135deg,#064e1a,#22C55E)',
    /* Font — Outfit: bold and rounded */
    titleFontFamily: "'Skyscapers', 'Permanent Marker', cursive",
    fontFamily: "'Outfit','Inter',sans-serif",
  },
  {
    id:       'sakura',
    label:    'Sakura Pink',
    accent:   '#EC4899',
    gradient: 'linear-gradient(135deg, #9d174d 0%, #DB2777 50%, #EC4899 100%)',
    glow:     'rgba(236,72,153,0.38)',
    shadow:   'rgba(236,72,153,0.45)',
    border:   'rgba(236,72,153,0.25)',
    /* Splash */
    splashAccent:    '#EC4899',
    splashGradient:  'linear-gradient(90deg,#EC4899,#f472b6,#EC4899)',
    splashBlobLeft:  'radial-gradient(circle,#8b1a5e 0%,#3d0028 50%,transparent 70%)',
    splashBlobRight: 'radial-gradient(circle,#0d5c52 0%,#032e28 50%,transparent 70%)',
    /* Hero */
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,10,100,0.38) 0%, transparent 70%), linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.10) 40%,rgba(0,0,0,0.72) 100%)',
    heroTitleColor: '#EC4899',
    heroCursorColor:'#EC4899',
    navActive: 'linear-gradient(135deg,#9d174d,#EC4899)',
    fontFamily: "'Inter',sans-serif",
  },
  {
    id:       'winter',
    label:    'Winter Arc',
    accent:   '#38BDF8',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284C7 50%, #38BDF8 100%)',
    glow:     'rgba(56,189,248,0.38)',
    shadow:   'rgba(56,189,248,0.45)',
    border:   'rgba(56,189,248,0.25)',
    /* Splash */
    splashAccent:    '#38BDF8',
    splashGradient:  'linear-gradient(90deg,#38BDF8,#7dd3fc,#38BDF8)',
    splashBlobLeft:  'radial-gradient(circle,#0c4a6e 0%,#001e3c 50%,transparent 70%)',
    splashBlobRight: 'radial-gradient(circle,#164e63 0%,#001e3c 50%,transparent 70%)',
    /* Hero */
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(2,132,199,0.38) 0%, transparent 70%), linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.10) 40%,rgba(0,0,0,0.72) 100%)',
    heroTitleColor: '#38BDF8',
    heroCursorColor:'#38BDF8',
    navActive: 'linear-gradient(135deg,#0c4a6e,#38BDF8)',
    /* Winter Arc — elegant icy font */
    fontFamily: "'Cinzel','Georgia',serif",
  },
];

const ThemeContext = createContext(null);

/* Pick theme index by rotating on each page load */
function pickThemeIndex() {
  const raw   = localStorage.getItem('pk_page_theme_idx');
  const prev  = raw !== null ? parseInt(raw, 10) : -1;
  const next  = (prev + 1) % PAGE_THEMES.length;
  localStorage.setItem('pk_page_theme_idx', String(next));
  return next;
}

/* Apply a theme's CSS variables to :root */
function applyTheme(theme) {
  const r = document.documentElement;
  r.setAttribute('data-theme', 'dark');
  r.setAttribute('data-page-theme', theme.id);

  r.style.setProperty('--accent-primary',        theme.accent);
  r.style.setProperty('--accent-gradient',        theme.gradient);
  r.style.setProperty('--accent-glow',            theme.glow);
  r.style.setProperty('--shadow-glow',            `0 0 24px ${theme.shadow}`);
  r.style.setProperty('--border-focus',           theme.border);
  r.style.setProperty('--text-accent',            theme.accent);
  r.style.setProperty('--hero-title-color',       theme.heroTitleColor);
  r.style.setProperty('--hero-cursor-color',      theme.heroCursorColor);
  r.style.setProperty('--nav-active-bg',          theme.navActive);
  r.style.setProperty('--font-hero',              theme.fontFamily);
}

export function ThemeProvider({ children }) {
  const [themeIdx] = useState(() => pickThemeIndex());
  const theme = PAGE_THEMES[themeIdx];

  useEffect(() => {
    applyTheme(theme);

    /* Inject font if Winter Arc or Forest Leaf */
    if (theme.id === 'winter') {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap';
      document.head.appendChild(link);
    } else if (theme.id === 'forest') {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap';
      document.head.appendChild(link);
    }

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeIdx, PAGE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
