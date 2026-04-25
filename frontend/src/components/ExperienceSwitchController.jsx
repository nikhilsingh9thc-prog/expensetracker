import React, { useState, useEffect } from 'react';
import './ExperienceSwitchController.css';

export default function ExperienceSwitchController() {
  const [targetExp, setTargetExp] = useState(null);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'confirm' | 'loading'

  useEffect(() => {
    const handleRequest = (e) => {
      setTargetExp(e.detail.newExp);
      setPhase('confirm');
    };

    window.addEventListener('request_experience_change', handleRequest);
    return () => window.removeEventListener('request_experience_change', handleRequest);
  }, []);

  const handleYes = () => {
    setPhase('loading');
    
    // Simulate loading for 1.5 seconds
    setTimeout(() => {
      localStorage.setItem('ui_experience', targetExp);
      window.dispatchEvent(new CustomEvent('experience_change', { detail: { newExp: targetExp } }));
      
      // Add a tiny delay to hide the overlay after the layout under it has already switched
      setTimeout(() => {
        setPhase('idle');
        setTargetExp(null);
      }, 50);
    }, 1500);
  };

  const handleNo = () => {
    setPhase('idle');
    setTargetExp(null);
  };

  if (phase === 'idle') return null;

  const isModern = targetExp === 'modern';
  const targetName = isModern ? 'Modern Version' : 'Classic Version';

  return (
    <div className="exp-switch-overlay fade-in">
      {phase === 'confirm' && (
        <div className="exp-switch-modal slide-up">
          <h2 className="exp-switch-title">Confirm Switch</h2>
          <p className="exp-switch-text">Do you want to change the interface to the {targetName}?</p>
          <div className="exp-switch-actions">
            <button className="exp-btn exp-btn-no" onClick={handleNo}>No</button>
            <button className="exp-btn exp-btn-yes" onClick={handleYes}>Yes</button>
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <div className="exp-loading-container">
          <div className="exp-spinner"></div>
          <p className="exp-loading-text">Switching to {targetName}...</p>
        </div>
      )}
    </div>
  );
}
