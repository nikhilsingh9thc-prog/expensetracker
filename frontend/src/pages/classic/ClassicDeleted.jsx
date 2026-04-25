import React from 'react';

export default function ClassicDeleted() {
  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Deleted Transactions</h1>
      
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: 'var(--kb-shadow)',
        textAlign: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--kb-text-light)" strokeWidth="1.5" style={{ marginBottom: '15px' }}>
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--kb-text)', marginBottom: '10px' }}>Trash is Empty</h2>
        <p style={{ color: 'var(--kb-text-light)' }}>
          To ensure strict data privacy and security, transactions are permanently deleted from the database. There are no recoverable deleted items.
        </p>
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
