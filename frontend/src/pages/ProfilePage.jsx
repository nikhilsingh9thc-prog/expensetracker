import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';


export default function ProfilePage() {
  const { t, language, setLanguage, LANGUAGES } = useLanguage();
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const { user, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: '', new_password: '', confirm_password: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [stats, setStats] = useState({ transactions: 0, income: 0, expense: 0 });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/analytics/summary/');
      setStats({
        transactions: res.data.total_transactions || 0,
        income: res.data.total_income || 0,
        expense: res.data.total_expenses || 0,
      });
    } catch (err) {
      // Stats are optional
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.username?.[0] || '?';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      await API.put('/auth/user/', profileForm);
      setProfileMsg(t('profileUpdated') || 'Profile updated successfully!');
      setEditing(false);
      // Refresh the page data
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setProfileErr(Object.values(data).flat().join(' '));
      } else {
        setProfileErr(t('profileUpdateFailed') || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    setPasswordMsg('');
    setPasswordErr('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordErr(t('passwordsNoMatch') || 'Passwords do not match.');
      setChangingPw(false);
      return;
    }

    try {
      await API.post('/auth/change-password/', passwordForm);
      setPasswordMsg(t('passwordChanged') || 'Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const data = err.response?.data;
      if (data?.old_password) {
        setPasswordErr(data.old_password);
      } else if (data && typeof data === 'object') {
        setPasswordErr(Object.values(data).flat().join(' '));
      } else {
        setPasswordErr(t('passwordChangeFailed') || 'Failed to change password.');
      }
    } finally {
      setChangingPw(false);
    }
  };

  const joinDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const formatCurrency = (val) => {
    const info = CURRENCIES.find((c) => c.code === currency);
    return `${info?.symbol || '₹'}${Number(val).toLocaleString()}`;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 {t('profile')}</h1>
          <p className="page-description">{t('profileDesc')}</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* ── LEFT: Profile Card ── */}
        <div className="card profile-card-main">
          <div className="profile-avatar-large">{getInitials()}</div>
          <div className="profile-name">{user?.first_name || user?.username || 'User'} {user?.last_name || ''}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-joined">📅 {t('memberSince') || 'Member since'} {joinDate}</div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{stats.transactions}</div>
              <div className="profile-stat-label">{t('totalTransactions')}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value" style={{ color: 'var(--success)' }}>{formatCurrency(stats.income)}</div>
              <div className="profile-stat-label">{t('totalIncome')}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(stats.expense)}</div>
              <div className="profile-stat-label">{t('totalExpenses')}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{formatCurrency(stats.income - stats.expense)}</div>
              <div className="profile-stat-label">{t('netBalance')}</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Profile Sections ── */}
        <div className="profile-sections">
          {/* Edit Profile */}
          <div className="card profile-section">
            <div className="card-header">
              <h3 className="profile-section-title">✏️ {t('editProfile') || 'Edit Profile'}</h3>
              {!editing && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                  {t('edit') || 'Edit'}
                </button>
              )}
            </div>

            {profileMsg && <div className="profile-success">✅ {profileMsg}</div>}
            {profileErr && <div className="auth-error">❌ {profileErr}</div>}

            {editing ? (
              <form onSubmit={handleProfileSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-first">{t('firstName')}</label>
                    <input id="profile-first" className="form-input" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-last">{t('lastName')}</label>
                    <input id="profile-last" className="form-input" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">{t('email')}</label>
                  <input id="profile-email" className="form-input" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                    {saving ? '...' : (t('save') || '💾 Save')}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setProfileErr(''); }} id="cancel-profile-btn">
                    {t('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="profile-field-row">
                  <span className="profile-field-label">{t('username')}</span>
                  <span className="profile-field-value">@{user?.username}</span>
                </div>
                <div className="profile-field-row">
                  <span className="profile-field-label">{t('firstName')}</span>
                  <span className="profile-field-value">{user?.first_name || '—'}</span>
                </div>
                <div className="profile-field-row">
                  <span className="profile-field-label">{t('lastName')}</span>
                  <span className="profile-field-value">{user?.last_name || '—'}</span>
                </div>
                <div className="profile-field-row">
                  <span className="profile-field-label">{t('email')}</span>
                  <span className="profile-field-value">{user?.email || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="card profile-section">
            <h3 className="profile-section-title">🔒 {t('changePassword') || 'Change Password'}</h3>
            {passwordMsg && <div className="profile-success">✅ {passwordMsg}</div>}
            {passwordErr && <div className="auth-error">❌ {passwordErr}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label" htmlFor="pw-old">{t('currentPassword') || 'Current Password'}</label>
                <input id="pw-old" className="form-input" type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="pw-new">{t('newPassword') || 'New Password'}</label>
                  <input id="pw-new" className="form-input" type="password" placeholder={t('minChars')} value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required minLength={8} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pw-confirm">{t('confirmPassword')}</label>
                  <input id="pw-confirm" className="form-input" type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required minLength={8} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={changingPw} id="change-pw-btn">
                {changingPw ? '...' : (t('changePasswordBtn') || '🔒 Change Password')}
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="card profile-section">
            <h3 className="profile-section-title">⚙️ {t('preferences') || 'Preferences'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="pref-lang">🌐 {t('language')}</label>
                <select id="pref-lang" className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pref-currency">💲 {t('currency')}</label>
                <select id="pref-currency" className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
            </div>


          </div>

          {/* Danger Zone */}
          <div className="card profile-section" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h3 className="profile-section-title" style={{ color: 'var(--danger)' }}>⚠️ {t('dangerZone') || 'Danger Zone'}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{t('logoutDesc') || 'Sign out of your account on this device.'}</p>
            <button className="btn btn-danger" onClick={logout} id="logout-btn">
              🚪 {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
