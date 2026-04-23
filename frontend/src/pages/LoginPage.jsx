import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeColorPicker from '../components/ThemeColorPicker';

export default function LoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // Check if this user has completed onboarding
      const onboardingKey = `${username}_onboarding_done`;
      if (localStorage.getItem(onboardingKey)) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">{t('welcomeBackAuth')}</h1>
          <p className="auth-subtitle">{t('signInToManage')}</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">{t('username')}</label>
            <input id="login-username" className="form-input" type="text" placeholder={t('enterUsername')} value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t('password')}</label>
            <input id="login-password" className="form-input" type="password" placeholder={t('enterPassword')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <div className="auth-footer">
          {t('noAccount')} <Link to="/register">{t('createOne')}</Link>
        </div>
      </div>

      {/* Theme picker shown below login card */}
      <div style={{ width: '100%', maxWidth: 400, marginTop: 16 }}>
        <ThemeColorPicker />
      </div>
    </div>
  );
}
