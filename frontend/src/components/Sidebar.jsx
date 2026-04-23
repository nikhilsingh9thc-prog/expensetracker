import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, LANGUAGES } = useLanguage();
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', icon: '📊', labelKey: 'dashboard' },
    { path: '/transactions', icon: '💳', labelKey: 'transactions' },
    { path: '/budgets', icon: '🎯', labelKey: 'budgets' },
    { path: '/reports', icon: '📈', labelKey: 'reports' },
    { path: '/converter', icon: '💱', labelKey: 'converter' },
    { path: '/help', icon: '❓', labelKey: 'helpCenter' },
    { path: '/profile', icon: '👤', labelKey: 'profile' },
  ];

  const getInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.username?.[0] || '?';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        <span className="sidebar-logo-text" style={{ marginLeft: 12 }}>Paise Kaha</span>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💰</div>
            <span className="sidebar-logo-text">Paise Kaha</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings: Language & Currency */}
        <div className="sidebar-settings">
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">🌐 {t('language')}</span>
            <select
              className="sidebar-setting-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">💲 {t('currency')}</span>
            <select
              className="sidebar-setting-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.first_name || user?.username || 'User'}
              </div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          {/* Logout + Dark Mode Toggle row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="sidebar-link"
              onClick={logout}
              style={{ color: 'var(--danger)', marginTop: 4, flex: 1 }}
            >
              <span className="sidebar-link-icon">🚪</span>
              <span>{t('logout')}</span>
            </button>

            {/* Dark Mode Toggle Switch */}
            <button
              id="dark-mode-toggle"
              onClick={toggle}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                flexShrink: 0,
                marginTop: 4,
                width: 46,
                height: 26,
                borderRadius: 13,
                border: 'none',
                cursor: 'pointer',
                padding: '3px',
                background: dark
                  ? 'linear-gradient(135deg, #DC2626, #EF4444)'
                  : 'rgba(0,150,230,0.15)',
                transition: 'background 0.3s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Knob */}
              <span style={{
                display: 'block',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: dark ? '#0D0D0D' : '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                transform: dark ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {dark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
