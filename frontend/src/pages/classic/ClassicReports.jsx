import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import './ClassicTheme.css';

export default function ClassicReports() {
  const [data, setData] = useState({
    summary: null,
    categories: [],
    trends: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const [sumRes, catRes, trendRes, txRes] = await Promise.all([
          API.get('/analytics/summary/'),
          API.get('/analytics/categories/'),
          API.get('/analytics/trends/'),
          API.get('/transactions/', { params: { page_size: 100 } })
        ]);

        setData({
          summary: sumRes.data,
          categories: catRes.data,
          trends: trendRes.data,
          transactions: txRes.data.results || (Array.isArray(txRes.data) ? txRes.data : [])
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReportsData();
  }, []);

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = data.transactions.map(tx => [
      tx.date,
      tx.description || '',
      tx.category_name || 'Uncategorized',
      tx.type,
      tx.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ fontSize: '1.5rem', padding: '20px', textAlign: 'center' }}>Loading your reports...</div>;
  }

  const { summary, categories, trends } = data;
  const currentMonth = summary?.monthly || { income: 0, expense: 0, balance: 0 };
  const allTime = summary?.all_time || { income: 0, expense: 0, balance: 0 };

  return (
    <div className="page-wrapper classic-reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <h1 className="classic-title" style={{ margin: 0 }}>Financial Reports</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="classic-btn" onClick={exportCSV} style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
            Download CSV
          </button>
          <button className="classic-btn" onClick={exportPDF} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="printable-content">
        {/* 1. OVERALL SUMMARY */}
        <section className="report-section">
          <h2 className="section-heading">Financial Summary (All Time)</h2>
          <div className="classic-summary-grid">
            <div className="classic-summary-card">
              <span className="label">Total Cash In</span>
              <div className="value val-income">₹{allTime.income.toLocaleString()}</div>
            </div>
            <div className="classic-summary-card">
              <span className="label">Total Cash Out</span>
              <div className="value val-expense">₹{allTime.expense.toLocaleString()}</div>
            </div>
            <div className="classic-summary-card">
              <span className="label">Net Balance</span>
              <div className="value val-neutral">₹{allTime.balance.toLocaleString()}</div>
            </div>
          </div>
        </section>

        {/* 2. CATEGORY BREAKDOWN */}
        <section className="report-section" style={{ marginTop: '30px' }}>
          <h2 className="section-heading">Category-wise Spending</h2>
          <div className="category-report-list">
            {categories.length > 0 ? categories.map(cat => (
              <div key={cat.category_id} className="category-report-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{cat.category_icon || '📁'}</span>
                  <span style={{ fontWeight: '600' }}>{cat.category_name}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--kb-expense)' }}>
                  ₹{cat.total.toLocaleString()}
                </div>
              </div>
            )) : <p style={{ color: 'var(--kb-text-light)' }}>No category data available.</p>}
          </div>
        </section>

        {/* 3. MONTHLY SUMMARY */}
        <section className="report-section" style={{ marginTop: '30px' }}>
          <h2 className="section-heading">Monthly Performance</h2>
          <div className="monthly-trends-list">
            {trends.slice(-6).reverse().map(month => (
              <div key={month.month} className="monthly-trend-card">
                <div className="trend-month-name">
                  {new Date(month.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="trend-details">
                  <div className="trend-row">
                    <span>In:</span>
                    <span className="val-income">₹{month.income.toLocaleString()}</span>
                  </div>
                  <div className="trend-row">
                    <span>Out:</span>
                    <span className="val-expense">₹{month.expense.toLocaleString()}</span>
                  </div>
                  <div className="trend-row" style={{ borderTop: '1px solid var(--kb-border)', marginTop: '5px', paddingTop: '5px' }}>
                    <span>Savings:</span>
                    <span className={month.income - month.expense >= 0 ? 'val-income' : 'val-expense'}>
                      ₹{(month.income - month.expense).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
