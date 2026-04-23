import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import AIFloatingWidget from '../components/AIFloatingWidget';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#22c55e', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const [summaryRes, breakdownRes, txRes, budgetRes] = await Promise.all([
        API.get('/analytics/summary/'),
        API.get('/analytics/category-breakdown/'),
        API.get('/transactions/', { params: { page_size: 5 } }),
        API.get('/budgets-status/'),
      ]);
      setSummary(summaryRes.data);
      setBreakdown(breakdownRes.data);
      setRecentTx(txRes.data.results || []);
      setBudgetStatus(budgetRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const doughnutData = {
    labels: breakdown.map((b) => b.category_name),
    datasets: [{
      data: breakdown.map((b) => b.total),
      backgroundColor: CHART_COLORS.slice(0, breakdown.length),
      borderWidth: 0, hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, cornerRadius: 8, padding: 12,
        callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` },
      },
    },
  };

  const alertBudgets = budgetStatus.filter((b) => b.alert);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('welcomeBack')} {user?.first_name || user?.username} 👋</h1>
          <p className="page-description">{t('financialOverview')}</p>
        </div>
        <Link to="/transactions" className="btn btn-primary">{t('addTransaction')}</Link>
      </div>

      <div className="stat-cards">
        <div className="card stat-card balance">
          <div className="stat-icon balance">💎</div>
          <div className="stat-label">{t('currentBalance')}</div>
          <div className="stat-value">{formatCurrency(summary?.all_time?.balance)}</div>
        </div>
        <div className="card stat-card income">
          <div className="stat-icon income">📈</div>
          <div className="stat-label">{t('monthlyIncome')}</div>
          <div className="stat-value income-color">{formatCurrency(summary?.monthly?.income)}</div>
        </div>
        <div className="card stat-card expense">
          <div className="stat-icon expense">📉</div>
          <div className="stat-label">{t('monthlyExpense')}</div>
          <div className="stat-value expense-color">{formatCurrency(summary?.monthly?.expense)}</div>
        </div>
        <div className="card stat-card transactions">
          <div className="stat-icon transactions">💳</div>
          <div className="stat-label">{t('totalTransactions')}</div>
          <div className="stat-value">{summary?.transaction_count || 0}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t('expenseBreakdown')}</div>
              <div className="card-subtitle">{t('currentMonthByCategory')}</div>
            </div>
          </div>
          {breakdown.length > 0 ? (
            <div className="chart-container"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">{t('noExpensesYet')}</div>
              <div className="empty-state-text">{t('addSomeTransactions')}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t('recentTransactions')}</div>
              <div className="card-subtitle">{t('latestActivity')}</div>
            </div>
            <Link to="/transactions" className="btn btn-secondary btn-sm">{t('viewAll')}</Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="transaction-list">
              {recentTx.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className={`transaction-icon ${tx.type}`}>{tx.category_icon || '📁'}</div>
                  <div className="transaction-info">
                    <div className="transaction-category">{tx.category_name || 'Uncategorized'}</div>
                    <div className="transaction-desc">{tx.description || 'No description'}</div>
                  </div>
                  <div className="transaction-right">
                    <div className={`transaction-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="transaction-date">{formatDate(tx.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-title">{t('noTransactions')}</div>
              <div className="empty-state-text">{t('startTracking')}</div>
            </div>
          )}
        </div>
      </div>

      {alertBudgets.length > 0 && (
        <div className="card" style={{ marginTop: 4 }}>
          <div className="card-header">
            <div>
              <div className="card-title">{t('budgetAlerts')}</div>
              <div className="card-subtitle">{t('categoriesApproaching')}</div>
            </div>
            <Link to="/budgets" className="btn btn-secondary btn-sm">{t('manageBudgets')}</Link>
          </div>
          <div className="budget-grid">
            {alertBudgets.map((b) => (
              <div key={b.id} className="budget-card" style={{ padding: 0 }}>
                <div className="budget-card-header">
                  <div className="budget-category">
                    <span className="budget-category-icon">{b.category_icon}</span>
                    <span className="budget-category-name">{b.category_name}</span>
                  </div>
                  <div className="budget-percentage" style={{ color: b.alert === 'exceeded' ? 'var(--danger)' : 'var(--warning)' }}>{b.percentage}%</div>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar ${b.alert === 'exceeded' ? 'danger' : 'warning'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                </div>
                <div className="budget-amounts">
                  <span>{t('spent')}: <strong className="budget-spent">{formatCurrency(b.spent)}</strong></span>
                  <span>{t('limit')}: {formatCurrency(b.limit_amount)}</span>
                </div>
                <div className={`budget-alert ${b.alert}`}>
                  {b.alert === 'exceeded' ? '🚨' : '⚠️'}
                  {b.alert === 'exceeded'
                    ? `${t('overBudgetBy')} ${formatCurrency(b.spent - b.limit_amount)}`
                    : `${(100 - b.percentage).toFixed(1)}% ${t('remaining')}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Floating Widget — Dashboard only */}
      <AIFloatingWidget />
    </div>
  );
}
