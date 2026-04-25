import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export default function TransactionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', date_from: '', date_to: '', search: '' });
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadCategories = useCallback(async () => {
    try { const res = await API.get('/categories/', { params: { page_size: 100 } }); setCategories(res.data.results || res.data); } catch (err) { console.error(err); }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const params = { page: currentPage };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.search) params.search = filters.search;
      const res = await API.get('/transactions/', { params });
      setTransactions(res.data.results || []);
      setPagination({ next: res.data.next, previous: res.data.previous, count: res.data.count || 0 });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [currentPage, filters]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const openAdd = useCallback(() => { 
    setEditingTx(null); 
    setForm({ type: 'expense', category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' }); 
    setShowModal(true); 
  }, []);

  const openEdit = (tx) => { setEditingTx(tx); setForm({ type: tx.type, category: tx.category, amount: tx.amount, date: tx.date, description: tx.description || '' }); setShowModal(true); };

  useEffect(() => {
    if (location.state?.openAdd) {
      openAdd();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, openAdd, location.pathname]);
  const updateFilter = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCurrentPage(1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTx) { await API.put(`/transactions/${editingTx.id}/`, form); showToast(t('transactionUpdated')); }
      else { await API.post('/transactions/', form); showToast(t('transactionAdded')); }
      setShowModal(false); loadTransactions();
    } catch (err) {
      const msg = err.response?.data;
      showToast(msg ? Object.values(msg).flat().join(' ') : t('failedToSave'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try { await API.delete(`/transactions/${id}/`); showToast(t('transactionDeleted')); loadTransactions(); } catch { showToast(t('failedToDelete'), 'error'); }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/transactions/export_csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click(); window.URL.revokeObjectURL(url);
      showToast(t('csvExported'));
    } catch { showToast(t('exportFailed'), 'error'); }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const filteredCategories = categories.filter((c) => !form.type || c.type === form.type);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1 className="page-title">{t('transactions')}</h1><p className="page-description">{t('manageIncomeExpenses')}</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport}>{t('exportCSV')}</button>
          <button className="btn btn-primary" onClick={openAdd}>{t('addTransaction')}</button>
        </div>
      </div>

      <div className="filters-bar">
        <select className="form-select" value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
          <option value="">{t('allTypes')}</option><option value="income">{t('income')}</option><option value="expense">{t('expense')}</option>
        </select>
        <select className="form-select" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">{t('allCategories')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <input className="form-input" type="date" value={filters.date_from} onChange={(e) => updateFilter('date_from', e.target.value)} />
        <input className="form-input" type="date" value={filters.date_to} onChange={(e) => updateFilter('date_to', e.target.value)} />
        <input className="form-input" type="text" placeholder={t('search')} value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} style={{ minWidth: 180 }} />
      </div>

      <div className="card">
        {transactions.length > 0 ? (
          <>
            <div className="transaction-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className={`transaction-icon ${tx.type}`}>{tx.category_icon || '📁'}</div>
                  <div className="transaction-info">
                    <div className="transaction-category">{tx.category_name || 'Uncategorized'}</div>
                    <div className="transaction-desc">{tx.description || 'No description'}</div>
                  </div>
                  <div className="transaction-right">
                    <div className={`transaction-amount ${tx.type}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</div>
                    <div className="transaction-date">{formatDate(tx.date)}</div>
                  </div>
                  <div className="transaction-actions">
                    <button className="action-btn" onClick={() => openEdit(tx)} title="Edit">✏️</button>
                    <button className="action-btn delete" onClick={() => handleDelete(tx.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button className="pagination-btn" disabled={!pagination.previous} onClick={() => setCurrentPage((p) => p - 1)}>{t('previous')}</button>
              <span className="pagination-info">Page {currentPage} · {pagination.count} total</span>
              <button className="pagination-btn" disabled={!pagination.next} onClick={() => setCurrentPage((p) => p + 1)}>{t('next')}</button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">{t('noTransactionsFound')}</div>
            <div className="empty-state-text">{filters.type || filters.category || filters.search ? t('tryAdjustingFilters') : t('clickAddTransaction')}</div>
            {!filters.type && !filters.category && <button className="btn btn-primary" onClick={openAdd}>{t('addFirstTransaction')}</button>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTx ? t('editTransaction') : t('addTransaction')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">{t('type')}</label>
                    <div className="sliding-toggle">
                      <div className={`sliding-toggle-slider ${form.type}`}></div>
                      <div className={`sliding-toggle-btn ${form.type === 'income' ? 'active' : ''}`} onClick={() => setForm({ ...form, type: 'income', category: '' })}>
                        {t('income')}
                      </div>
                      <div className={`sliding-toggle-btn ${form.type === 'expense' ? 'active' : ''}`} onClick={() => setForm({ ...form, type: 'expense', category: '' })}>
                        {t('expense')}
                      </div>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">{t('category')}</label>
                    <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                      <option value="">{t('selectCategory')}</option>
                      {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">{t('amount')} (₹)</label>
                    <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">{t('date')}</label>
                    <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label className="form-label">{t('description')}</label>
                  <input className="form-input" type="text" placeholder={t('whatWasThisFor')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{editingTx ? t('update') : t('addTransaction')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.message}</div></div>}
    </div>
  );
}
