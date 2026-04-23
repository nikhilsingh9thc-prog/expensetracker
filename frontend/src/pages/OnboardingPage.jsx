import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, ACCENTS } from '../context/ThemeContext';

const AVATARS = [
  '🦁', '🐻', '🦊', '🐯', '🐸', '🦋',
  '🐧', '🦄', '🐺', '🦅', '🐬', '🦉',
  '🐉', '🦩', '🐙', '🦝', '🐮', '🦀',
];

const GENDERS = [
  { id: 'male',   label: 'Male',   icon: '♂️' },
  { id: 'female', label: 'Female', icon: '♀️' },
  { id: 'nb',     label: 'Non-binary', icon: '⚧️' },
  { id: 'skip',   label: 'Prefer not to say', icon: '🤐' },
];

const STEP_TITLES = [
  { step: 1, label: 'Pick Your Theme',    icon: '🎨' },
  { step: 2, label: 'Choose Your Avatar', icon: '🧑‍🎤' },
  { step: 3, label: 'About You',          icon: '📅' },
];

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle, accent, setAccent } = useTheme();

  const [step, setStep]     = useState(1);
  const [avatar, setAvatar] = useState('🦁');
  const [gender, setGender] = useState('');
  const [dob, setDob]       = useState('');
  const [animDir, setAnimDir] = useState('forward'); // for animation direction

  const age = calcAge(dob);

  const storageKey = user ? `${user.username}_onboarding_done` : 'onboarding_done';

  const goNext = () => {
    setAnimDir('forward');
    setStep(s => s + 1);
  };
  const goBack = () => {
    setAnimDir('back');
    setStep(s => s - 1);
  };

  const finish = () => {
    // Save profile choices to localStorage
    const profile = { avatar, gender, dob, age, accent, dark };
    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(`${storageKey}_profile`, JSON.stringify(profile));
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Brand ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontSize: 44, marginBottom: 8,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
        }}>💰</div>
        <h1 style={{
          fontSize: 26, fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', margin: 0,
        }}>Paise Kaha</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Let's set up your experience, {user?.first_name || user?.username} 👋
        </p>
      </div>

      {/* ── Step Progress Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        marginBottom: 28, width: '100%', maxWidth: 480,
      }}>
        {STEP_TITLES.map((s, i) => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_TITLES.length - 1 ? 1 : 0 }}>
            {/* Circle */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: step > s.step ? 15 : 13, fontWeight: 700,
              background: step >= s.step ? 'var(--accent-gradient)' : 'var(--bg-glass)',
              border: step >= s.step ? 'none' : '2px solid var(--border-glass)',
              color: step >= s.step ? '#fff' : 'var(--text-muted)',
              boxShadow: step === s.step ? 'var(--shadow-glow)' : 'none',
              transition: 'all 0.3s',
            }}>
              {step > s.step ? '✓' : s.icon}
            </div>
            {/* Connector */}
            {i < STEP_TITLES.length - 1 && (
              <div style={{
                flex: 1, height: 3, borderRadius: 2, margin: '0 6px',
                background: step > s.step
                  ? 'var(--accent-gradient)'
                  : 'var(--border-glass)',
                transition: 'background 0.4s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 24, padding: 28,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Step label */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Step {step} of 3
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
            {STEP_TITLES[step - 1].label}
          </div>
        </div>

        {/* ─────────── STEP 1: Theme ─────────── */}
        {step === 1 && (
          <div>
            {/* Light / Dark pill */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mode</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: '☀️ Light', isDark: false },
                  { label: '🌙 Dark',  isDark: true  },
                ].map(m => (
                  <button key={m.label} onClick={() => m.isDark !== dark && toggle()} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                    background: dark === m.isDark ? 'var(--accent-gradient)' : 'var(--bg-glass)',
                    color: dark === m.isDark ? '#fff' : 'var(--text-secondary)',
                    boxShadow: dark === m.isDark ? 'var(--shadow-glow)' : 'none',
                    transition: 'all 0.25s',
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            {/* Accent colours */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Accent Colour</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {ACCENTS.map(a => (
                  <button key={a.id} onClick={() => setAccent(a.id)} title={a.label} style={{
                    width: 46, height: 46, borderRadius: '50%', border: 'none',
                    background: a.gradient, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: accent === a.id ? `3px solid var(--text-primary)` : '3px solid transparent',
                    outlineOffset: 2,
                    transform: accent === a.id ? 'scale(1.18)' : 'scale(1)',
                    boxShadow: accent === a.id ? `0 6px 20px ${a.color}55` : `0 2px 8px ${a.color}30`,
                    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>
                    {accent === a.id && <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                Active: <strong style={{ color: 'var(--accent-primary)' }}>
                  {ACCENTS.find(a => a.id === accent)?.label}
                </strong>
                {' · '}{dark ? '🌙 Dark' : '☀️ Light'}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── STEP 2: Avatar + Gender ─────────── */}
        {step === 2 && (
          <div>
            {/* Avatar grid */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pick an Avatar</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {AVATARS.map(em => (
                  <button key={em} onClick={() => setAvatar(em)} style={{
                    width: '100%', aspectRatio: '1', borderRadius: 14,
                    border: avatar === em ? '2.5px solid var(--accent-primary)' : '2px solid var(--border-glass)',
                    background: avatar === em ? 'var(--bg-glass)' : 'transparent',
                    cursor: 'pointer', fontSize: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: avatar === em ? 'var(--shadow-glow)' : 'none',
                    transform: avatar === em ? 'scale(1.12)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>{em}</button>
                ))}
              </div>
            </div>

            {/* Gender selection */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GENDERS.map(g => (
                  <button key={g.id} onClick={() => setGender(g.id)} style={{
                    padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    border: gender === g.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: gender === g.id ? 'var(--bg-glass)' : 'transparent',
                    color: gender === g.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: gender === g.id ? 600 : 400,
                    fontSize: 13, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: gender === g.id ? 'var(--shadow-glow)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 16 }}>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── STEP 3: DOB + Age ─────────── */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {/* Big avatar preview */}
              <div style={{
                fontSize: 72, marginBottom: 8,
                filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.15))',
                animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>{avatar}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {gender ? GENDERS.find(g => g.id === gender)?.icon + ' ' + GENDERS.find(g => g.id === gender)?.label : ''}
              </div>
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: 8,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>📅 Date of Birth</label>
              <input
                type="date"
                value={dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setDob(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12, fontSize: 15,
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
              />
            </div>

            {/* Age badge */}
            {age !== null && (
              <div style={{
                padding: '14px 20px', borderRadius: 14,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                textAlign: 'center',
                animation: 'slideUp 0.3s ease',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Your Age</div>
                <div style={{
                  fontSize: 36, fontWeight: 800,
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{age}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>years old</div>
              </div>
            )}

            {!dob && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                You can skip this — it's optional
              </p>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button onClick={goBack} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass)', color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>← Back</button>
          )}
          {step < 3 ? (
            <button onClick={goNext} style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none',
              background: 'var(--accent-gradient)', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
              transition: 'all 0.2s',
            }}>Continue →</button>
          ) : (
            <button onClick={finish} style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none',
              background: 'var(--accent-gradient)', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
              transition: 'all 0.2s',
            }}>🚀 Let's Go!</button>
          )}
        </div>

        {/* Skip all */}
        {step < 3 && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={finish} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
            }}>Skip for now</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
