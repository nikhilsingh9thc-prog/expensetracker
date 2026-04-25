import React from 'react';

export default function ClassicHelp() {
  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Help & Instructions</h1>
      
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '10px' }}>How to add a transaction?</h2>
        <p style={{ color: 'var(--kb-text-light)', lineHeight: '1.5' }}>
          Click the floating <b>+</b> button at the bottom of the screen. Select whether it's a <b>Cash In</b> (income) or <b>Cash Out</b> (expense), enter the amount, select a category, and click Save.
        </p>
      </div>

      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '10px' }}>How to view Reports?</h2>
        <p style={{ color: 'var(--kb-text-light)', lineHeight: '1.5' }}>
          Open the sidebar menu and tap on <b>Reports</b> to see your monthly total income, expenses, and current balance.
        </p>
      </div>

      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '10px' }}>What is the Dashboard?</h2>
        <p style={{ color: 'var(--kb-text-light)', lineHeight: '1.5' }}>
          The Dashboard is your main screen. It shows your complete transaction history. You can use the filter tabs (Daily, Weekly, Monthly) to narrow down the view.
        </p>
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
