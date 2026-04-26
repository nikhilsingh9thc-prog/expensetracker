import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import ClassicDateRangeSheet from './ClassicDateRangeSheet';

export default function ClassicTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, total_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);
  
  // Date Range State
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    type: 'month',
    value: 'this_month',
    label: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
  });

  // Advanced Filtering/Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all, income, expense
    minAmount: '',
    maxAmount: '',
    sort: 'date_desc' // date_desc, date_asc, amount_desc, amount_asc
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData(selectedRange);
    
    // Update header label if it exists
    const labelEl = document.getElementById('header-date-label');
    if (labelEl) labelEl.innerText = selectedRange.label;

    // Listen for quick add success
    const handleRefresh = () => loadDashboardData(selectedRange);
    const handleOpenSheet = () => setShowDateSheet(true);
    
    window.addEventListener('refresh_dashboard', handleRefresh);
    window.addEventListener('open_date_sheet', handleOpenSheet);
    
    return () => {
      window.removeEventListener('refresh_dashboard', handleRefresh);
      window.removeEventListener('open_date_sheet', handleOpenSheet);
    };
  }, [selectedRange]);

  const loadDashboardData = async (range) => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const params = { page_size: 100, _t: timestamp };
      
      const summaryParams = { _t: timestamp };
      
      // Apply filters based on range
      if (range.type === 'month') {
        const now = new Date();
        let targetDate = now;
        
        if (range.value === 'last_month') {
          targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        } else if (range.value.startsWith('month_')) {
          const offset = parseInt(range.value.split('_')[1]);
          targetDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        }
        
        if (range.value !== 'all_time') {
          const year = targetDate.getFullYear();
          const month = targetDate.getMonth() + 1;
          params.date_from = `${year}-${month.toString().padStart(2, '0')}-01`;
          const lastDay = new Date(year, month, 0).getDate();
          params.date_to = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
          
          summaryParams.month = month;
          summaryParams.year = year;
        }
      } else if (range.type === 'year') {
        params.date_from = `${range.value}-01-01`;
        params.date_to = `${range.value}-12-31`;
        summaryParams.year = range.value;
      } else if (range.type === 'day') {
        const now = new Date();
        let targetDate = now;
        if (range.value === 'yesterday') {
          targetDate = new Date(now.setDate(now.getDate() - 1));
        }
        const dateStr = targetDate.toISOString().split('T')[0];
        params.date_from = dateStr;
        params.date_to = dateStr;
      } else if (range.type === 'custom') {
        params.date_from = range.startDate;
        params.date_to = range.endDate;
      }

      const [txRes, sumRes] = await Promise.all([
        API.get('/transactions/', { params }),
        API.get('/analytics/summary/', { params: summaryParams })
      ]);
      
      const txs = txRes.data.results || (Array.isArray(txRes.data) ? txRes.data : []);
      
      // Calculate summary based on range type
      let flatSummary = { total_income: 0, total_expense: 0, total_balance: 0 };
      
      if (range.type === 'month' && range.value !== 'all_time') {
        flatSummary = {
          total_income: sumRes.data?.monthly?.income || 0,
          total_expense: sumRes.data?.monthly?.expense || 0,
          total_balance: sumRes.data?.monthly?.balance || 0
        };
      } else if (range.type === 'year') {
        flatSummary = {
          total_income: sumRes.data?.yearly?.income || 0,
          total_expense: sumRes.data?.yearly?.expense || 0,
          total_balance: sumRes.data?.yearly?.balance || 0
        };
      } else if (range.value === 'all_time') {
        flatSummary = {
          total_income: sumRes.data?.all_time?.income || 0,
          total_expense: sumRes.data?.all_time?.expense || 0,
          total_balance: sumRes.data?.all_time?.balance || 0
        };
      } else {
        // For day or custom, calculate from transactions
        let inc = 0, exp = 0;
        txs.forEach(t => {
          if (t.type === 'income') inc += parseFloat(t.amount);
          else exp += parseFloat(t.amount);
        });
        flatSummary = {
          total_income: inc,
          total_expense: exp,
          total_balance: inc - exp
        };
      }

      // Calculate running balance for display (starting from current balance downwards)
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
      setDeletingIds(prev => [...prev, txId]);
      const deletedTx = transactions.find(t => t.id === txId);
      
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
          loadDashboardData(selectedRange);
        } catch (err) {
          console.error("Delete failed", err);
          alert("Failed to delete transaction.");
          setDeletingIds(prev => prev.filter(id => id !== txId));
          loadDashboardData(selectedRange);
        }
      }, 200);
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

  if (loading && transactions.length === 0) {
    return <div style={{ fontSize: '1.2rem', padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Mini Summary for Transactions Page */}
      <div className="kb-mini-summary" style={{ padding: '0 20px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--kb-text-light)' }}>
          <span>In: <span className="val-income">₹{summary.total_income.toLocaleString()}</span></span>
          <span>Out: <span className="val-expense">₹{summary.total_expense.toLocaleString()}</span></span>
          <span>Bal: <span className="val-neutral">₹{summary.total_balance.toLocaleString()}</span></span>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="kb-search-container">
        <div className="kb-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search note, amount..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        <button 
          className={`kb-filter-toggle ${showFilterSheet ? 'active' : ''}`} 
          onClick={() => setShowFilterSheet(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filter
        </button>
      </div>

      {/* DATE SELECTOR */}
      <div className="kb-date-selector">
        <button className="kb-date-btn" onClick={() => setShowDateSheet(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {selectedRange.label}
          <svg className="arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>


      {/* TRANSACTION LIST */}
      {(() => {
        console.log("Filtering transactions for range:", selectedRange.label, transactions);
        
        let filteredTxs = transactions.filter(tx => {
          // 1. Type Filtering
          if (filters.type !== 'all' && tx.type !== filters.type) return false;

          // 2. Amount Range
          const amt = parseFloat(tx.amount);
          if (filters.minAmount && amt < parseFloat(filters.minAmount)) return false;
          if (filters.maxAmount && amt > parseFloat(filters.maxAmount)) return false;

          // 3. Search Query
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const noteMatch = (tx.description || '').toLowerCase().includes(q);
            const catMatch = (tx.category_name || '').toLowerCase().includes(q);
            const amtMatch = tx.amount.toString().includes(q);
            const dateMatch = tx.date.includes(q);
            if (!noteMatch && !catMatch && !amtMatch && !dateMatch) return false;
          }

          return true;
        });

        // 4. Sorting
        filteredTxs = [...filteredTxs].sort((a, b) => {
          if (filters.sort === 'date_desc') return new Date(b.date) - new Date(a.date);
          if (filters.sort === 'date_asc') return new Date(a.date) - new Date(b.date);
          if (filters.sort === 'amount_desc') return parseFloat(b.amount) - parseFloat(a.amount);
          if (filters.sort === 'amount_asc') return parseFloat(a.amount) - parseFloat(b.amount);
          return 0;
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

      {/* Filter Floating Panel */}
      {showFilterSheet && (
        <div className="kb-filter-panel-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="kb-filter-panel" onClick={e => e.stopPropagation()}>
            <div className="kb-filter-panel-header">
              <h3>Filter & Sort</h3>
              <button className="close-mini" onClick={() => setShowFilterSheet(false)}>✕</button>
            </div>
            <div className="kb-filter-panel-content">
              <div className="kb-filter-section mini">
                <h4>Sort By</h4>
                <div className="kb-sort-options mini">
                  <button className={`sort-chip mini ${filters.sort === 'date_desc' ? 'active' : ''}`} onClick={() => setFilters({...filters, sort: 'date_desc'})}>Newest</button>
                  <button className={`sort-chip mini ${filters.sort === 'date_asc' ? 'active' : ''}`} onClick={() => setFilters({...filters, sort: 'date_asc'})}>Oldest</button>
                  <button className={`sort-chip mini ${filters.sort === 'amount_desc' ? 'active' : ''}`} onClick={() => setFilters({...filters, sort: 'amount_desc'})}>High</button>
                  <button className={`sort-chip mini ${filters.sort === 'amount_asc' ? 'active' : ''}`} onClick={() => setFilters({...filters, sort: 'amount_asc'})}>Low</button>
                </div>
              </div>

              <div className="kb-filter-section mini">
                <h4>Type</h4>
                <div className="kb-type-options mini">
                  <button className={`type-chip mini ${filters.type === 'all' ? 'active' : ''}`} onClick={() => setFilters({...filters, type: 'all'})}>All</button>
                  <button className={`type-chip mini ${filters.type === 'income' ? 'active' : ''}`} onClick={() => setFilters({...filters, type: 'income'})}>In</button>
                  <button className={`type-chip mini ${filters.type === 'expense' ? 'active' : ''}`} onClick={() => setFilters({...filters, type: 'expense'})}>Out</button>
                </div>
              </div>

              <div className="kb-filter-section mini">
                <h4>Amount</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="kb-filter-input mini" 
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="kb-filter-input mini" 
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="mini-reset-btn" onClick={() => setFilters({ type: 'all', minAmount: '', maxAmount: '', sort: 'date_desc' })}>
                  Reset
                </button>
                <button className="mini-apply-btn" onClick={() => setShowFilterSheet(false)}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
