import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export default function BudgetsPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [form, setForm] = useState({ category: '', limit_amount: '', month: now.getMonth() + 1, year: now.getFullYear() });

  const showToastMsg = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    try {
      const [statusRes, catRes] = await Promise.all([
        API.get('/budgets-status/', { params: { month, year } }),
        API.get('/categories/', { params: { page_size: 100 } }),
      ]);
      setBudgetStatus(statusRes.data);
      const cats = catRes.data.results || catRes.data;
      setCategories(cats.filter((c) => c.type === 'expense'));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = () => { setForm({ category: '', limit_amount: '', month, year }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/budgets/', { category: form.category, limit_amount: form.limit_amount, month, year });
      showToastMsg(t('budgetCreated')); setShowModal(false); loadData();
    } catch (err) {
      const msg = err.response?.data;
      showToastMsg(msg?.non_field_errors ? t('budgetExists') : t('failedToCreateBudget'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('removeConfirm'))) return;
    try { await API.delete(`/budgets/${id}/`); showToastMsg(t('budgetRemoved')); loadData(); } catch { showToastMsg(t('failedToRemoveBudget'), 'error'); }
  };

  const getMonthName = (m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m-1];
  const availableCategories = categories.filter((c) => !budgetStatus.find((b) => b.category_id === c.id));

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1 className="page-title">{t('budgetManagement')}</h1><p className="page-description">{t('setSpendingLimits')}</p></div>
        <button className="btn btn-primary" onClick={openModal}>{t('setBudget')}</button>
      </div>

      <div className="filters-bar">
        <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
        </select>
        <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {budgetStatus.length > 0 ? (
        <div className="budget-grid">
          {budgetStatus.map((b) => (
            <div key={b.id} className="card budget-card">
              <div className="budget-card-header">
                <div className="budget-category">
                  <span className="budget-category-icon">{b.category_icon}</span>
                  <span className="budget-category-name">{b.category_name}</span>
                </div>
                <div className="budget-percentage" style={{ color: b.alert === 'exceeded' ? 'var(--danger)' : b.alert === 'warning' ? 'var(--warning)' : 'var(--success)' }}>{b.percentage}%</div>
              </div>
              <div className="progress-bar-container">
                <div className={`progress-bar ${b.alert === 'exceeded' ? 'danger' : b.alert === 'warning' ? 'warning' : ''}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
              </div>
              <div className="budget-amounts">
                <span>{t('spent')}: <strong className="budget-spent">{formatCurrency(b.spent)}</strong></span>
                <span>{t('limit')}: {formatCurrency(b.limit_amount)}</span>
              </div>
              <div className="budget-amounts" style={{ marginTop: 8 }}>
                <span style={{ color: 'var(--success)' }}>{t('remainingLabel')}: {formatCurrency(b.remaining)}</span>
                <button className="action-btn delete" onClick={() => handleDelete(b.id)} title="Remove">🗑️</button>
              </div>
              {b.alert && (
                <div className={`budget-alert ${b.alert}`}>
                  {b.alert === 'exceeded' ? '🚨' : '⚠️'}
                  {b.alert === 'exceeded' ? `${t('overBudgetBy')} ${formatCurrency(b.spent - b.limit_amount)}!` : `${b.percentage}% ${t('warningUsed')} ${formatCurrency(b.remaining)} ${t('left')}`}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">{t('noBudgetsSet')}</div>
          <div className="empty-state-text">{t('setMonthlyLimits')}</div>
          <button className="btn btn-primary" onClick={openModal}>{t('setFirstBudget')}</button>
        </div></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('setBudgetFor')} {getMonthName(month)} {year}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">{t('category')}</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">{t('selectExpenseCategory')}</option>
                    {availableCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">{t('monthlyLimit')} (₹)</label>
                  <input className="form-input" type="number" step="100" min="100" placeholder="e.g., 5000" value={form.limit_amount} onChange={(e) => setForm({ ...form, limit_amount: e.target.value })} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('setBudget')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.message}</div></div>}
    </div>
  );
}
