import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

const navItems = [
  { path: '/',             label: 'Home',         end: true },
  { path: '/transactions', label: 'Transactions' },
  { path: '/budgets',      label: 'Budgets' },
  { path: '/reports',      label: 'Reports' },
  { path: '/converter',    label: 'Converter' },
  { path: '/assistant',    label: 'AI' },
];

export default function TopNav() {
  const { user, logout } = useAuth();
  const { language, setLanguage, LANGUAGES } = useLanguage();
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return '?';
    const f = user.first_name?.[0] || user.username?.[0] || '?';
    const l = user.last_name?.[0] || '';
    return (f + l).toUpperCase();
  };

  return (
    <>
      {/* ── Top floating navbar ── */}
      <header className="topnav">
        <div className="topnav-inner">

          {/* Logo */}
          <NavLink to="/" className="topnav-logo">
            <div className="topnav-logo-icon">💰</div>
            <div className="topnav-logo-text">
              <span className="topnav-logo-name">PAISE KAHA</span>
              <span className="topnav-logo-sub">MONEY MANAGEMENT</span>
            </div>
          </NavLink>

          {/* Desktop nav links */}
          <nav className="topnav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `topnav-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="topnav-right">
            {/* Language */}
            <select
              className="topnav-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              title="Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>
              ))}
            </select>

            {/* Currency */}
            <select
              className="topnav-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              title="Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>

            {/* Profile button */}
            <div className="topnav-user-wrap" style={{ position: 'relative' }}>
              <button
                className="topnav-avatar"
                onClick={() => setUserMenuOpen(o => !o)}
                title={user?.username}
              >
                {getInitials()}
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="topnav-user-dropdown">
                    <div className="topnav-user-info">
                      <div className="topnav-user-name">{user?.first_name || user?.username}</div>
                      <div className="topnav-user-email">{user?.email}</div>
                    </div>
                    <div className="topnav-dropdown-divider" />
                    <button className="topnav-dropdown-item" onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>
                      👤 Profile
                    </button>
                    <button className="topnav-dropdown-item" onClick={() => { navigate('/help'); setUserMenuOpen(false); }}>
                      ❓ Help Center
                    </button>
                    <div className="topnav-dropdown-divider" />
                    <button className="topnav-dropdown-item danger" onClick={() => { logout(); setUserMenuOpen(false); }}>
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="topnav-hamburger" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="topnav-mobile">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `topnav-mobile-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/profile" className="topnav-mobile-link" onClick={() => setMobileOpen(false)}>Profile</NavLink>
            <button className="topnav-mobile-link danger" onClick={logout}>🚪 Logout</button>
          </nav>
        )}
      </header>

      {/* Spacer so content doesn't go behind the fixed nav */}
      <div style={{ height: 72 }} />
    </>
  );
}
