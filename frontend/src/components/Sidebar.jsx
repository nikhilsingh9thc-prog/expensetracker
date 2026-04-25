import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, LANGUAGES } = useLanguage();
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/',             icon: '📊', labelKey: 'dashboard' },
    { path: '/transactions', icon: '💳', labelKey: 'transactions' },
    { path: '/budgets',      icon: '🎯', labelKey: 'budgets' },
    { path: '/reports',      icon: '📈', labelKey: 'reports' },
    { path: '/converter',    icon: '💱', labelKey: 'converter' },
    { path: '/help',         icon: '❓', labelKey: 'helpCenter' },
    { path: '/profile',      icon: '👤', labelKey: 'profile' },
    { path: '/assistant',    icon: '🤖', labelKey: 'aiAssistant' },
  ];

  const getInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.username?.[0] || '?';
    const last  = user.last_name?.[0]  || '';
    return (first + last).toUpperCase();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>☰</button>
        <span className="sidebar-logo-text" style={{ marginLeft: 12 }}>Paise Kaha</span>
      </div>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💰</div>
            <div>
              <div className="sidebar-logo-text">Paise Kaha</div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 1 }}>
                Money Management
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Language & Currency */}
        <div className="sidebar-settings">
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">🌐 {t('language')}</span>
            <select className="sidebar-setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-setting-row">
            <span className="sidebar-setting-label">💲 {t('currency')}</span>
            <select className="sidebar-setting-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User + Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.first_name || user?.username || 'User'}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={logout} style={{ color: 'var(--danger)', marginTop: 4 }}>
            <span className="sidebar-link-icon">🚪</span>
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
