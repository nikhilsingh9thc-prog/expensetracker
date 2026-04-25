import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import API from '../../api/axios';

export default function ClassicProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  
  const [profileForm, setProfileForm] = useState({ username: '', first_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        first_name: user.first_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!isEditingProfile) {
      setIsEditingProfile(true);
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await API.put('/auth/user/', profileForm);
      setMessage('Profile updated successfully! Refreshing...');
      setIsEditingProfile(false);
      setTimeout(() => window.location.reload(), 1000); // Reload to sync header
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }
    setPassLoading(true);
    try {
      await API.post('/auth/change-password/', passwordForm);
      setMessage('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to change password. Check your old password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Settings & Profile</h1>
      
      {message && <div style={{ background: 'var(--kb-income)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--kb-expense)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

      {/* HEADER PROFILE CARD */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', background: 'var(--kb-accent-gradient)', 
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', boxShadow: 'var(--kb-shadow)'
        }}>
          {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
        </div>
        <h2 style={{ color: 'var(--kb-text)', margin: '0', fontSize: '1.4rem' }}>{user?.first_name || user?.username}</h2>
        <div style={{ color: 'var(--kb-text-light)', fontSize: '0.9rem' }}>{user?.email || '@' + user?.username}</div>
      </div>

      {/* 1. PROFILE SECTION */}
      <div style={{ background: 'var(--kb-bg)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--kb-shadow)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--kb-surface)', paddingBottom: '10px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', margin: 0 }}>Profile Details</h2>
          {!isEditingProfile && (
            <button type="button" onClick={() => setIsEditingProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--kb-primary)', fontWeight: 'bold', cursor: 'pointer' }}>
              Edit Profile
            </button>
          )}
        </div>
        <form onSubmit={handleProfileSubmit}>
          <div className="classic-form-group">
            <label className="classic-label">Username</label>
            <input 
              type="text" required 
              className="classic-input"
              value={profileForm.username}
              disabled={!isEditingProfile}
              style={{ background: isEditingProfile ? 'var(--kb-bg)' : 'var(--kb-surface)', opacity: isEditingProfile ? 1 : 0.7 }}
              onChange={e => setProfileForm({...profileForm, username: e.target.value})}
            />
          </div>
          <div className="classic-form-group">
            <label className="classic-label">Display Name</label>
            <input 
              type="text" 
              className="classic-input"
              placeholder="e.g. John Doe"
              value={profileForm.first_name}
              disabled={!isEditingProfile}
              style={{ background: isEditingProfile ? 'var(--kb-bg)' : 'var(--kb-surface)', opacity: isEditingProfile ? 1 : 0.7 }}
              onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
            />
          </div>
          <div className="classic-form-group">
            <label className="classic-label">Email</label>
            <input 
              type="email" 
              className="classic-input"
              value={profileForm.email}
              disabled={!isEditingProfile}
              style={{ background: isEditingProfile ? 'var(--kb-bg)' : 'var(--kb-surface)', opacity: isEditingProfile ? 1 : 0.7 }}
              onChange={e => setProfileForm({...profileForm, email: e.target.value})}
            />
          </div>
          {isEditingProfile && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="classic-btn" style={{ flex: 1, padding: '12px', background: 'var(--kb-surface)', color: 'var(--kb-text)', border: '1px solid var(--kb-border)' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="classic-btn classic-btn-primary" style={{ flex: 2, padding: '12px' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. PREFERENCES SECTION */}
      <div style={{ background: 'var(--kb-bg)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--kb-shadow)', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '15px', borderBottom: '1px solid var(--kb-surface)', paddingBottom: '10px' }}>Preferences</h2>
        <div className="classic-form-group">
          <label className="classic-label">Language</label>
          <select 
            className="classic-input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
            ))}
          </select>
        </div>
        <div className="classic-form-group">
          <label className="classic-label">Currency</label>
          <select 
            className="classic-input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map(curr => (
              <option key={curr.code} value={curr.code}>{curr.flag} {curr.name} ({curr.symbol})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. SECURITY SECTION */}
      <div style={{ background: 'var(--kb-bg)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--kb-shadow)', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '15px', borderBottom: '1px solid var(--kb-surface)', paddingBottom: '10px' }}>Security</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="classic-form-group">
            <label className="classic-label">Current Password <span style={{ color: 'var(--kb-expense)' }}>*</span></label>
            <input 
              type="password" required 
              className="classic-input"
              placeholder="••••••••"
              value={passwordForm.old_password}
              onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})}
            />
          </div>
          <div className="classic-form-group">
            <label className="classic-label">New Password <span style={{ color: 'var(--kb-expense)' }}>*</span></label>
            <input 
              type="password" required 
              className="classic-input"
              placeholder="••••••••"
              value={passwordForm.new_password}
              onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
            />
          </div>
          <div className="classic-form-group">
            <label className="classic-label">Confirm Password <span style={{ color: 'var(--kb-expense)' }}>*</span></label>
            <input 
              type="password" required 
              className="classic-input"
              placeholder="••••••••"
              value={passwordForm.confirm_password}
              onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
            />
          </div>
          <button type="submit" disabled={passLoading} className="classic-btn" style={{ width: '100%', padding: '12px', background: 'var(--kb-surface)', color: 'var(--kb-text)', border: '1px solid var(--kb-border)' }}>
            {passLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* 4. ACCOUNT ACTIONS */}
      <div style={{ background: 'var(--kb-bg)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--kb-shadow)', textAlign: 'center' }}>
        <button onClick={() => { logout(); navigate('/login'); }} className="classic-btn" style={{ width: '100%', padding: '15px', color: 'white', background: 'var(--kb-expense)', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Logout Safely
        </button>
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
