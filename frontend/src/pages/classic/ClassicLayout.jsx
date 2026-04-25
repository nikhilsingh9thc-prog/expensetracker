import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import ClassicDashboard from './ClassicDashboard';
import ClassicAddExpense from './ClassicAddExpense';
import ClassicReports from './ClassicReports';
import ClassicBackup from './ClassicBackup';
import ClassicCalculator from './ClassicCalculator';
import ClassicCalendar from './ClassicCalendar';
import ClassicAccounts from './ClassicAccounts';
import ClassicHelp from './ClassicHelp';
import ClassicTransfer from './ClassicTransfer';
import ClassicAccountSummary from './ClassicAccountSummary';
import ClassicDeleted from './ClassicDeleted';
import ClassicProfile from './ClassicProfile';
import ClassicSavingsGoal from './ClassicSavingsGoal';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../../api/axios';
import './ClassicTheme.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function ClassicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currency } = useCurrency();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('kb_classic_dark') === 'true');
  const [classicTheme, setClassicTheme] = useState(() => localStorage.getItem('kb_classic_accent') || 'blue');
  const [lastSeen, setLastSeen] = useState('Active');
  const [graphModalOpen, setGraphModalOpen] = useState(false);

  React.useEffect(() => {
    // Initial load
    const lastAct = parseInt(localStorage.getItem('kb_last_activity') || '0');
    if (lastAct) {
      const now = new Date().getTime();
      const diffMin = Math.floor((now - lastAct) / 60000);
      if (diffMin >= 1) {
        if (diffMin < 60) setLastSeen(`Last seen ${diffMin} min ago`);
        else setLastSeen(`Last seen ${Math.floor(diffMin / 60)} hour${Math.floor(diffMin / 60) > 1 ? 's' : ''} ago`);
      }
    }

    const updateActivity = () => {
      localStorage.setItem('kb_last_activity', new Date().getTime().toString());
      setLastSeen('Active');
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    const interval = setInterval(() => {
      const lastActTime = parseInt(localStorage.getItem('kb_last_activity') || '0');
      if (!lastActTime) return;
      
      const now = new Date().getTime();
      const diffMs = now - lastActTime;
      const diffMin = Math.floor(diffMs / 60000);
      
      if (diffMin < 1) {
        setLastSeen('Active');
      } else if (diffMin < 60) {
        setLastSeen(`Last seen ${diffMin} min ago`);
      } else {
        const diffHrs = Math.floor(diffMin / 60);
        setLastSeen(`Last seen ${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`);
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('kb_classic_dark', newMode);
  };

  const handleSwitch = () => {
    window.dispatchEvent(new CustomEvent('request_experience_change', { detail: { newExp: 'modern' } }));
    setDrawerOpen(false);
  };

  const userName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || 'User';

  const userInitials = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase() + 
                       (user?.last_name?.[0] || '').toUpperCase();

  const themes = [
    { id: 'blue', color: '#93c5fd' },
    { id: 'purple', color: '#c4b5fd' },
    { id: 'green', color: '#86efac' },
    { id: 'peach', color: '#ffbba6' },
    { id: 'yellow', color: '#fde047' }
  ];

  return (
    <div className={`classic-app classic-theme-${classicTheme} ${drawerOpen ? 'sidebar-open' : ''}`} data-theme={darkMode ? "dark" : "light"}>
      {/* SIDE DRAWER */}
      <div className={`classic-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className="classic-drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">Paisa Kahan</h2>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          
          <div className="drawer-content">
            <div className="drawer-user-card" onClick={() => { setDrawerOpen(false); navigate('/profile'); }} style={{ cursor: 'pointer' }}>
              <div className="drawer-user-avatar">{userInitials}</div>
              <div className="drawer-user-info">
                <div className="drawer-user-name">{userName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div className={`status-dot ${lastSeen === 'Active' ? 'active' : 'inactive'}`}></div>
                  <div className="drawer-user-members" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{lastSeen}</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '30px', padding: '0 5px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/summary'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  Summary
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/account-summary'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Account Summary
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/transactions'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  Transactions
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/accounts'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Accounts
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/transfer'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                  Transfer
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/reports'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  Reports
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/calendar'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Calendar
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/calculator'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
                  Cash Calculator
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/savings'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Savings Goals
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/backup'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Backup & Restore
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/deleted'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Deleted Transactions
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/help'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Help
                </button>
                <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/profile'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Settings
                </button>
              </div>
            </div>
            
            <div className="drawer-footer">
              <button className="drawer-footer-link" onClick={() => { logout(); navigate('/login'); }} style={{ flex: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
              </button>
              <button className="kb-icon-btn" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} style={{ color: 'var(--kb-text-light)', border: '1px solid var(--kb-border)', width: '40px', height: '40px' }}>
                {darkMode ? 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> : 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                }
              </button>
            </div>

            <div className="theme-selector">
              <div className="theme-label">Accent Color</div>
              <div className="theme-options">
                {themes.map(t => (
                  <div 
                    key={t.id} 
                    className={`theme-dot ${classicTheme === t.id ? 'active' : ''}`}
                    style={{ backgroundColor: t.color }}
                    onClick={() => {
                      setClassicTheme(t.id);
                      localStorage.setItem('kb_classic_accent', t.id);
                    }}
                  />
                ))}
              </div>
            </div>

            <button className="classic-switch-btn" onClick={handleSwitch}>
              Switch to Modern Experience
            </button>
          </div>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="kb-header kb-animated-header">
        <div className="kb-header-top">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button className="kb-icon-btn" onClick={() => setDrawerOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            {location.pathname !== '/' && (
              <button className="kb-icon-btn" onClick={() => navigate('/')} style={{ padding: '0 5px' }} title="Back to Home">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </button>
            )}
          </div>

          <div className="kb-header-title-container">
            <div className="kb-header-title-text">Paisa Kahan</div>
            <div className="kb-header-tagline">Track your daily expenses easily and stay in control</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="kb-user-badge">
              {userName}
            </div>
            <button className="kb-icon-btn" onClick={() => navigate('/profile')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="kb-main">
        <Routes>
          <Route path="/" element={<ClassicDashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/add" element={<ClassicAddExpense />} />
          <Route path="/reports" element={<ClassicReports />} />
          
          <Route path="/summary" element={<Navigate to="/" replace />} />
          <Route path="/transactions" element={<Navigate to="/" replace />} />
          <Route path="/account-summary" element={<ClassicAccountSummary />} />
          <Route path="/accounts" element={<ClassicAccounts />} />
          <Route path="/transfer" element={<ClassicTransfer />} />
          <Route path="/calendar" element={<ClassicCalendar />} />
          <Route path="/calculator" element={<ClassicCalculator />} />
          <Route path="/backup" element={<ClassicBackup />} />
          <Route path="/savings" element={<ClassicSavingsGoal />} />
          <Route path="/deleted" element={<ClassicDeleted />} />
          <Route path="/help" element={<ClassicHelp />} />
          <Route path="/profile" element={<ClassicProfile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="classic-nav">
        <button className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Overview</span>
        </button>
        <button className="nav-btn" onClick={() => navigate('/add')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          <span>Cash In</span>
        </button>
        <div className="nav-add-btn" onClick={() => navigate('/add')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
        <button className="nav-btn" onClick={() => navigate('/add')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>
          <span>Cash Out</span>
        </button>
        <button className={`nav-btn ${graphModalOpen ? 'active' : ''}`} onClick={() => setGraphModalOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20V14"></path></svg>
          <span>Graphs</span>
        </button>
      </nav>



      {/* GRAPH MODAL */}
      {graphModalOpen && <GraphModal onClose={() => setGraphModalOpen(false)} />}
    </div>
  );
}

function GraphModal({ onClose }) {
  const [data, setData] = useState({ income: 0, expense: 0, categories: {}, daily: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[DEBUG] Fetching graph data from /transactions/");
        const res = await api.get('/transactions/', { params: { page_size: 100 } });
        const transactions = res.data.results || (Array.isArray(res.data) ? res.data : []);
        console.log("[DEBUG] Processed transactions for graph:", transactions);
        
        let inc = 0, exp = 0;
        const cats = {};
        const daily = {};

        // Sort by date to get trend
        const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(t => {
          const amt = parseFloat(t.amount);
          if (t.type === 'income') inc += amt;
          else exp += amt;

          if (t.type === 'expense') {
            cats[t.category_name] = (cats[t.category_name] || 0) + amt;
          }

          const date = new Date(t.date).toLocaleDateString();
          daily[date] = (daily[date] || 0) + (t.type === 'income' ? amt : -amt);
        });

        setData({ income: inc, expense: exp, categories: cats, daily });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const barData = {
    labels: ['Total Cash In', 'Total Cash Out'],
    datasets: [{
      label: 'Amount',
      data: [data.income, data.expense],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderRadius: 12,
    }]
  };

  const pieData = {
    labels: Object.keys(data.categories),
    datasets: [{
      data: Object.values(data.categories),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#6366f1'],
    }]
  };

  const lineData = {
    labels: Object.keys(data.daily).slice(-7),
    datasets: [{
      label: 'Daily Balance Trend',
      data: Object.values(data.daily).slice(-7),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  return (
    <div className="kb-modal-overlay" onClick={onClose}>
      <div className="kb-modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '95%', width: '1100px' }}>
        <div className="kb-modal-header">
          <div>
            <h3 style={{ fontSize: '1.8rem' }}>Your Money Summary</h3>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Simple view of your spending and savings</p>
          </div>
          <button className="kb-modal-close" onClick={onClose} style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>Loading your summary...</div>
        ) : (
          <div className="kb-graph-horizontal-row">
            {/* 1. Bar Chart: In vs Out */}
            <div className="kb-graph-compact-card">
              <h4 className="compact-title">In vs Out</h4>
              <div className="kb-chart-wrapper-compact">
                <Bar data={barData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                  scales: { 
                    y: { display: false },
                    x: { ticks: { font: { size: 10 } } }
                  }
                }} />
              </div>
            </div>

            {/* 2. Pie Chart: Categories */}
            <div className="kb-graph-compact-card">
              <h4 className="compact-title">Categories</h4>
              <div className="kb-chart-wrapper-compact">
                <Pie data={pieData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>

            {/* 3. Line Chart: Trend */}
            <div className="kb-graph-compact-card">
              <h4 className="compact-title">Trend</h4>
              <div className="kb-chart-wrapper-compact">
                <Line data={lineData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { 
                    y: { display: false },
                    x: { display: false }
                  }
                }} />
              </div>
            </div>

            {/* 4. Balance Card */}
            <div className="kb-graph-compact-card balance-compact">
              <h4 className="compact-title">Balance</h4>
              <div className="kb-balance-display-compact">
                <div className="kb-balance-amount-compact" style={{ color: (data.income - data.expense) >= 0 ? '#10b981' : '#ef4444' }}>
                  ₹{(data.income - data.expense).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="classic-btn classic-btn-primary" onClick={onClose} style={{ maxWidth: '200px' }}>
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}

