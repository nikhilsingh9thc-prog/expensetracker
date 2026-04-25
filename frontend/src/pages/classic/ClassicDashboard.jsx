import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function ClassicDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, total_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [deletingIds, setDeletingIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const timestamp = new Date().getTime();
      const [txRes, sumRes] = await Promise.all([
        API.get('/transactions/', { params: { page_size: 50, _t: timestamp } }),
        API.get('/analytics/summary/', { params: { _t: timestamp } })
      ]);
      
      const txs = txRes.data.results || (Array.isArray(txRes.data) ? txRes.data : []);
      // Map the analytics summary to flat structure
      const flatSummary = {
        total_income: sumRes.data?.all_time?.income || 0,
        total_expense: sumRes.data?.all_time?.expense || 0,
        total_balance: sumRes.data?.all_time?.balance || 0
      };

      // Calculate running balance for display
      let currentBalance = flatSummary.total_balance;
      const txsWithBalance = txs.map(tx => {
        const bal = currentBalance;
        if (tx.type === 'income') {
          currentBalance -= parseFloat(tx.amount);
        } else {
          currentBalance += parseFloat(tx.amount);
        }
        return { ...tx, runningBalance: bal };
      });
      
      console.log("[DEBUG] Loaded transactions in Classic UI:", txsWithBalance);
      
      setTransactions(txsWithBalance);
      setSummary(flatSummary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (txId) => {
    if (window.confirm("Do you want to delete this transaction?")) {
      // Optimistic visual delete
      setDeletingIds(prev => [...prev, txId]);
      
      const deletedTx = transactions.find(t => t.id === txId);
      
      // Update summary balance locally instantly
      if (deletedTx) {
        setSummary(prev => {
          let newBalance = prev.total_balance;
          let newIncome = prev.total_income;
          let newExpense = prev.total_expense;
          if (deletedTx.type === 'income') {
            newBalance -= parseFloat(deletedTx.amount);
            newIncome -= parseFloat(deletedTx.amount);
          } else {
            newBalance += parseFloat(deletedTx.amount);
            newExpense -= parseFloat(deletedTx.amount);
          }
          return {
            total_income: newIncome,
            total_expense: newExpense,
            total_balance: newBalance
          };
        });
      }

      setTimeout(async () => {
        try {
          await API.delete(`/transactions/${txId}/`);
          // Clean data refresh from backend
          loadDashboardData();
        } catch (err) {
          console.error("Delete failed", err);
          alert("Failed to delete transaction.");
          // Revert animation
          setDeletingIds(prev => prev.filter(id => id !== txId));
          loadDashboardData();
        }
      }, 200); // Wait for css animation
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };
  
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const tabs = ['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

  if (loading) {
    return <div style={{ fontSize: '1.2rem', padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      {/* SUMMARY CARD (TOP) */}
      <div className="kb-summary-card">
        <div className="kb-summary-row">
          <div className="kb-summary-item">
            <span className="label">Cash In</span>
            <span className="value val-income">₹{summary.total_income}</span>
          </div>
          <div className="kb-operator">-</div>
          <div className="kb-summary-item">
            <span className="label">Cash Out</span>
            <span className="value val-expense">₹{summary.total_expense}</span>
          </div>
          <div className="kb-operator">=</div>
          <div className="kb-summary-item">
            <span className="label">Balance</span>
            <span className="value val-neutral">₹{summary.total_balance}</span>
          </div>
        </div>
      </div>

      {/* DATE SELECTOR */}
      <div className="kb-date-selector">
        <button className="kb-date-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Apr 2026
          <svg className="arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="kb-filter-tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`kb-filter-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TRANSACTION LIST */}
      {(() => {
        const filteredTxs = transactions.filter(tx => {
          if (activeTab === 'All') return true;
          const txDate = new Date(tx.date);
          const now = new Date();
          if (activeTab === 'Daily') return txDate.toDateString() === now.toDateString();
          if (activeTab === 'Weekly') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return txDate >= lastWeek && txDate <= now;
          }
          if (activeTab === 'Monthly') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          if (activeTab === 'Yearly') return txDate.getFullYear() === now.getFullYear();
          return true;
        });

        if (filteredTxs.length === 0) {
          return (
            <div className="kb-empty-state">
              <div className="kb-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
              </div>
              <p>No records found for this time period.</p>
            </div>
          );
        }

        return (
          <div className="kb-tx-list">
            {filteredTxs.map(tx => (
              <div key={tx.id} className={`kb-tx-row ${deletingIds.includes(tx.id) ? 'deleting' : ''}`}>
                <div className="kb-tx-left">
                  <div className="kb-tx-date">{formatDate(tx.date)}</div>
                  <div className="kb-tx-time">{formatTime(tx.created_at || tx.date)} &bull; {tx.description || tx.category_name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="kb-tx-right">
                    <div className={`kb-tx-amount ${tx.type === 'income' ? 'val-income' : 'val-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                    </div>
                    <div className="kb-tx-balance">Bal: ₹{tx.runningBalance.toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kb-expense)', padding: '5px' }}
                    title="Delete Transaction"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
