import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClassicHome() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--kb-text)', marginBottom: '10px' }}>Paisa Kahan</h1>
        <p style={{ color: 'var(--kb-text-light)', fontSize: '1.1rem' }}>Welcome to your simple digital cash book</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '350px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          className="kb-action-btn"
          style={{ backgroundColor: 'var(--kb-accent)', color: 'white' }}>
          Go to Dashboard
        </button>
        
        <button 
          onClick={() => navigate('/add', { state: { type: 'expense' } })}
          className="kb-action-btn kb-btn-out">
          Add Expense (Cash Out)
        </button>

        <button 
          onClick={() => navigate('/add', { state: { type: 'income' } })}
          className="kb-action-btn kb-btn-in">
          Add Income (Cash In)
        </button>
      </div>

    </div>
  );
}
