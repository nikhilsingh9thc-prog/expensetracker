import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import ClassicDashboard from './ClassicDashboard';
import ClassicAddExpense from './ClassicAddExpense';
import ClassicReports from './ClassicReports';
import ClassicTransactions from './ClassicTransactions';
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
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('income');

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
            <div className="drawer-brand">
              <div className="drawer-logo">💰</div>
              <div className="drawer-logo-text-group">
                <h2 className="drawer-title">Paise Kaha</h2>
                <div className="drawer-subtitle">MONEY MANAGEMENT</div>
              </div>
            </div>
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


          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="kb-user-badge">
              {userName}
            </div>
            <button className="kb-icon-btn" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} style={{ width: '36px', height: '36px' }}>
              {darkMode ? 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> : 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              }
            </button>
            <button className="kb-icon-btn" onClick={() => navigate('/profile')} style={{ width: '36px', height: '36px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
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
          <Route path="/transactions" element={<ClassicTransactions />} />
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
          <span>Home</span>
        </button>
        <button className="nav-btn" onClick={() => { setQuickAddType('income'); setQuickAddOpen(true); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          <span style={{ color: '#10b981' }}>Income</span>
        </button>
        <div className="nav-add-btn" onClick={() => navigate('/add')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
        <button className="nav-btn" onClick={() => { setQuickAddType('expense'); setQuickAddOpen(true); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>
          <span style={{ color: '#ef4444' }}>Expense</span>
        </button>
        <button className={`nav-btn ${location.pathname === '/reports' ? 'active' : ''}`} onClick={() => navigate('/reports')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>Reports</span>
        </button>
      </nav>

      {/* QUICK ADD MODAL */}
      {quickAddOpen && (
        <QuickAddModal 
          type={quickAddType} 
          onClose={() => setQuickAddOpen(false)} 
          onSuccess={() => {
            setQuickAddOpen(false);
            window.dispatchEvent(new Event('refresh_dashboard'));
          }}
        />
      )}



    </div>
  );
}

function QuickAddModal({ type, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      
      // Fetch categories to pick a default one
      const catRes = await api.get('/transactions/categories/');
      const categories = catRes.data.results || catRes.data;
      const defaultCat = categories.find(c => c.name.toLowerCase().includes(type === 'income' ? 'income' : 'other')) || categories[0];

      await api.post('/transactions/', {
        amount: parseFloat(amount),
        description: description || (type === 'income' ? 'Quick Income' : 'Quick Expense'),
        type: type,
        category: defaultCat?.id,
        date: date
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kb-quick-add-overlay" onClick={onClose}>
      <div className="kb-quick-add-content" onClick={e => e.stopPropagation()}>
        <div className="quick-add-header">
          <h3 className={`quick-add-title ${type}`}>Quick {type === 'income' ? 'Income' : 'Expense'}</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="quick-input-group">
          <label>Amount (₹)</label>
          <input 
            type="number" 
            className="quick-amount-input" 
            placeholder="0.00" 
            autoFocus
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div className="quick-input-group">
          <label>Note / Description</label>
          <input 
            type="text" 
            className="quick-field-input" 
            placeholder="What was this for?" 
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="quick-input-group">
          <label>Date</label>
          <input 
            type="date" 
            className="quick-field-input" 
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className="quick-actions">
          <button className="quick-btn quick-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="quick-btn quick-btn-add" onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

