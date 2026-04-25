import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../api/axios';


export default function RegisterPage() {
  const { t } = useLanguage();
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const usernameTimeout = useRef(null);

  // Debounced username availability check
  const checkUsername = useCallback((username) => {
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current);
    if (!username || username.length < 3) { setUsernameStatus(null); return; }
    setUsernameStatus('checking');
    usernameTimeout.current = setTimeout(async () => {
      try {
        const res = await API.post('/auth/check-username/', { username });
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'username') checkUsername(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError(t('passwordsNoMatch') || 'Passwords do not match.'); return; }
    if (usernameStatus === 'taken') { setError('Username is already taken. Please choose another.'); return; }
    setLoading(true);
    try {
      await register({ ...form });
      await login(form.username, form.password);
      navigate('/onboarding'); // Always show onboarding for new users
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">{t('createAccount')}</h1>
          <p className="auth-subtitle">{t('startManaging')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          {/* Name row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-first">{t('firstName')}</label>
              <input
                id="reg-first" className="form-input"
                name="first_name" placeholder="John"
                value={form.first_name} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-last">{t('lastName')}</label>
              <input
                id="reg-last" className="form-input"
                name="last_name" placeholder="Doe"
                value={form.last_name} onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">{t('email')}</label>
            <input
              id="reg-email" className="form-input"
              type="email" name="email" placeholder="john@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">{t('username')}</label>
            <input
              id="reg-username" className="form-input"
              name="username" placeholder="johndoe"
              value={form.username} onChange={handleChange} required
            />
            {usernameStatus && (
              <div className={`username-check ${usernameStatus}`}>
                {usernameStatus === 'checking'  && '⏳ Checking...'}
                {usernameStatus === 'available' && '✅ Username is available!'}
                {usernameStatus === 'taken'     && '❌ Username is already taken'}
              </div>
            )}
          </div>

          {/* Password row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass">{t('password')}</label>
              <input
                id="reg-pass" className="form-input"
                name="password" type="password"
                placeholder={t('minChars')}
                value={form.password} onChange={handleChange}
                required minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass2">{t('confirmPassword')}</label>
              <input
                id="reg-pass2" className="form-input"
                name="password2" type="password"
                placeholder={t('repeatPassword')}
                value={form.password2} onChange={handleChange}
                required minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading || usernameStatus === 'taken'}
            id="register-btn"
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <div className="auth-footer">
          {t('alreadyHaveAccount')} <Link to="/login">{t('signInLink')}</Link>
        </div>
      </div>


    </div>
  );
}
