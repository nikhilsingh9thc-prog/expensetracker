import React from 'react';
import API from '../../api/axios';

export default function ClassicBackup() {
  const handleDownload = async () => {
    try {
      const res = await API.get('/transactions/export_csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Failed to download backup:', err);
      alert('Failed to download backup data. Please try again.');
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Backup & Restore</h1>
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)',
        textAlign: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--kb-text-light)" strokeWidth="1.5" style={{ marginBottom: '15px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--kb-text)', marginBottom: '10px' }}>Download Data Backup</h2>
        <p style={{ color: 'var(--kb-text-light)', marginBottom: '20px' }}>
          Securely export all your transactions as a CSV file to your local device.
        </p>
        <button 
          onClick={handleDownload}
          className="classic-btn classic-btn-primary" 
          style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
          Download CSV File
        </button>
      </div>

      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: 'var(--kb-shadow)',
        textAlign: 'center',
        opacity: 0.6
      }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--kb-text)', marginBottom: '10px' }}>Restore Data</h2>
        <p style={{ color: 'var(--kb-text-light)', marginBottom: '20px' }}>
          Upload a previously exported CSV file to restore your entries.
        </p>
        <button 
          disabled
          className="classic-btn" 
          style={{ width: '100%', padding: '15px', fontSize: '1.1rem', background: 'var(--kb-surface)', color: 'var(--kb-text-light)', cursor: 'not-allowed' }}>
          Coming Soon
        </button>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
