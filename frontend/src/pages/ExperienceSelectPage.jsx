import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExperienceSelectPage({ onSelect }) {
  const navigate = useNavigate();

  const handleSelect = (experience) => {
    localStorage.setItem('ui_experience', experience);
    // Dispatch event to notify App.jsx/MainRouter
    window.dispatchEvent(new CustomEvent('experience_change', { detail: { newExp: experience } }));
    onSelect(experience);
    navigate('/');
  };

  return (
    <div style={styles.container}>
      {/* Background blobs for modern feel */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>Choose Your Experience</h1>
        <p style={styles.subtitle}>Personalize how you track your daily expenses.</p>

        <div style={styles.optionsContainer}>
          {/* MODERN CARD */}
          <div 
            style={{...styles.card, ...styles.modernCard}} 
            onClick={() => handleSelect('modern')}
            className="exp-card"
          >
            <div style={styles.cardHeader}>
              <div style={styles.modernIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h2 style={styles.cardTitle}>Modern Version</h2>
            </div>
            <p style={styles.cardDesc}>
              Stylish UI with glassmorphism, dynamic graphs, and vibrant theme rotation.
            </p>
            <button style={{...styles.button, ...styles.modernButton}}>Experience Modern</button>
          </div>

          {/* CLASSIC CARD */}
          <div 
            style={{...styles.card, ...styles.classicCard}} 
            onClick={() => handleSelect('classic')}
            className="exp-card"
          >
            <div style={styles.cardHeader}>
              <div style={styles.classicIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h2 style={styles.cardTitle}>Classic Version</h2>
            </div>
            <p style={styles.cardDesc}>
              Simplified, ultra-clean layout with large fonts and straightforward navigation.
            </p>
            <button style={{...styles.button, ...styles.classicButton}}>Go Classic</button>
          </div>
        </div>
      </div>

      <style>{`
        .exp-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .exp-card:hover {
          transform: translateY(-15px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
        }
        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '40%',
    height: '40%',
    background: 'radial-gradient(circle, rgba(147, 197, 253, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
    zIndex: 0,
    animation: 'blobFloat 15s infinite alternate ease-in-out',
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
    zIndex: 0,
    animation: 'blobFloat 20s infinite alternate-reverse ease-in-out',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1000px',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    textAlign: 'center',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
    marginBottom: '50px',
    textAlign: 'center',
    fontWeight: '400',
  },
  optionsContainer: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    width: '340px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.8)',
    position: 'relative',
    overflow: 'hidden',
  },
  modernCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
  },
  classicCard: {
    background: '#ffffff',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modernIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
  },
  classicIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#f1f5f9',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0',
  },
  cardDesc: {
    fontSize: '1.05rem',
    color: '#64748b',
    marginBottom: '35px',
    lineHeight: '1.6',
    textAlign: 'center',
    flexGrow: 1,
  },
  button: {
    padding: '16px 24px',
    borderRadius: '14px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  modernButton: {
    backgroundColor: '#1e293b',
    color: 'white',
  },
  classicButton: {
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
  }
};
