import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClassicPlaceholder({ title }) {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--kb-text)', marginBottom: '15px' }}>{title}</h1>
        <p style={{ color: 'var(--kb-text-light)', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto' }}>
          This feature will be available here. We are currently working on bringing this functionality to the Classic Version.
        </p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="kb-action-btn"
        style={{ backgroundColor: 'var(--kb-accent)', color: 'white', maxWidth: '250px', width: '100%' }}>
        Back to Dashboard
      </button>

    </div>
  );
}
