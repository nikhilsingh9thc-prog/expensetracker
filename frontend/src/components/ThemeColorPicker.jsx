import { useTheme, ACCENTS } from '../context/ThemeContext';

export default function ThemeColorPicker({ compact = false }) {
  const { dark, toggle, accent, setAccent } = useTheme();

  return (
    <div style={{
      padding: compact ? '12px 16px' : '20px',
      borderRadius: 16,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-glass)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            🎨 Select Theme
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Choose your accent colour
          </div>
        </div>

        {/* Light / Dark toggle pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 20, padding: '4px 8px',
        }}>
          <button
            onClick={() => dark && toggle()}
            title="Light Mode"
            style={{
              border: 'none', cursor: 'pointer', borderRadius: 14,
              padding: '3px 10px', fontSize: 12, fontWeight: 600,
              background: !dark ? 'var(--accent-gradient)' : 'transparent',
              color: !dark ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >☀️ Light</button>
          <button
            onClick={() => !dark && toggle()}
            title="Dark Mode"
            style={{
              border: 'none', cursor: 'pointer', borderRadius: 14,
              padding: '3px 10px', fontSize: 12, fontWeight: 600,
              background: dark ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'transparent',
              color: dark ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >🌙 Dark</button>
        </div>
      </div>

      {/* Colour Circles */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            id={`accent-${a.id}`}
            onClick={() => setAccent(a.id)}
            title={a.label}
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              border: accent === a.id
                ? `3px solid var(--text-primary)`
                : '3px solid transparent',
              outline: accent === a.id
                ? '2px solid rgba(0,0,0,0.12)'
                : '2px solid transparent',
              background: a.gradient,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), border 0.2s',
              transform: accent === a.id ? 'scale(1.15)' : 'scale(1)',
              boxShadow: accent === a.id
                ? `0 4px 16px ${a.color}55`
                : `0 2px 8px ${a.color}30`,
            }}
          >
            {accent === a.id && (
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Active label */}
      <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>
        Active: <strong style={{ color: 'var(--accent-primary)' }}>
          {ACCENTS.find(a => a.id === accent)?.label}
        </strong>
        {' · '}
        {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </div>
    </div>
  );
}
