import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ClassicReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await API.get('/analytics/summary/');
        setSummary({
          total_income: res.data?.all_time?.income || 0,
          total_expense: res.data?.all_time?.expense || 0,
          total_balance: res.data?.all_time?.balance || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) {
    return <div style={{ fontSize: '1.5rem', padding: '20px' }}>Loading reports...</div>;
  }

  if (!summary) {
    return <div style={{ fontSize: '1.5rem', padding: '20px' }}>Failed to load reports.</div>;
  }

  const { total_income, total_expense, total_balance } = summary;

  return (
    <div className="page-wrapper">
      <h1 className="classic-title" style={{ textAlign: 'center' }}>Monthly Summary</h1>
      
      <div className="classic-summary-grid">
        <div className="classic-summary-card">
          <h2 className="classic-summary-title">Total Income</h2>
          <div className="classic-summary-value val-income">₹{total_income}</div>
        </div>

        <div className="classic-summary-card">
          <h2 className="classic-summary-title">Total Expenses</h2>
          <div className="classic-summary-value val-expense">₹{total_expense}</div>
        </div>

        <div className="classic-summary-card">
          <h2 className="classic-summary-title">Current Balance</h2>
          <div className="classic-summary-value val-neutral">₹{total_balance}</div>
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
