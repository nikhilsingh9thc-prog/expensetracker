import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316','#06b6d4'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const getMonthName = (m) => MONTHS[m - 1];

export default function ReportsPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b, tr] = await Promise.all([
        API.get('/analytics/summary/', { params: { month, year } }),
        API.get('/analytics/category-breakdown/', { params: { month, year } }),
        API.get('/analytics/trends/'),
      ]);
      setSummary(s.data); setBreakdown(b.data); setTrends(tr.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleExport = async () => {
    try {
      const res = await API.get('/transactions/export_csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click(); window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, cornerRadius: 8, padding: 12 } },
    scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b', callback: (v) => formatCurrency(v) }, grid: { color: 'rgba(255,255,255,0.04)' } } },
  };

  const trendsData = {
    labels: trends.map((tr) => { const [y, m] = tr.month.split('-'); return getMonthName(parseInt(m)).substring(0, 3) + ' ' + y.substring(2); }),
    datasets: [
      { label: t('income'), data: trends.map((tr) => tr.income), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: t('expense'), data: trends.map((tr) => tr.expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 4 },
    ],
  };

  const doughnutData = { labels: breakdown.map((b) => b.category_name), datasets: [{ data: breakdown.map((b) => b.total), backgroundColor: CHART_COLORS.slice(0, breakdown.length), borderWidth: 0, hoverOffset: 8 }] };
  const barData = { labels: [getMonthName(month) + ' ' + year], datasets: [
    { label: t('income'), data: [summary?.monthly?.income || 0], backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 6, barPercentage: 0.4 },
    { label: t('expense'), data: [summary?.monthly?.expense || 0], backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6, barPercentage: 0.4 },
  ]};

  const doughnutOpts = { ...chartOpts, cutout: '65%', scales: undefined, plugins: { ...chartOpts.plugins, legend: { position: 'bottom', labels: chartOpts.plugins.legend.labels } } };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1 className="page-title">{t('reportsAnalytics')}</h1><p className="page-description">{t('visualizeData')}</p></div>
        <button className="btn btn-secondary" onClick={handleExport}>{t('exportCSV')}</button>
      </div>

      <div className="filters-bar">
        <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
        </select>
        <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="stat-cards">
        <div className="card stat-card income"><div className="stat-icon income">📈</div><div className="stat-label">{t('monthlyIncome')}</div><div className="stat-value income-color">{formatCurrency(summary?.monthly?.income)}</div></div>
        <div className="card stat-card expense"><div className="stat-icon expense">📉</div><div className="stat-label">{t('monthlyExpenses')}</div><div className="stat-value expense-color">{formatCurrency(summary?.monthly?.expense)}</div></div>
        <div className="card stat-card balance"><div className="stat-icon balance">💎</div><div className="stat-label">{t('netSavings')}</div><div className="stat-value" style={{ color: (summary?.monthly?.balance || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(summary?.monthly?.balance)}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">{t('yearlySummary')} ({year})</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div><div className="stat-label">{t('totalIncome')}</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(summary?.yearly?.income)}</div></div>
          <div><div className="stat-label">{t('totalExpenses')}</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(summary?.yearly?.expense)}</div></div>
          <div><div className="stat-label">{t('netBalance')}</div><div style={{ fontSize: 22, fontWeight: 700, color: (summary?.yearly?.balance || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(summary?.yearly?.balance)}</div></div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header"><div><div className="card-title">{t('spendingTrends')}</div><div className="card-subtitle">{t('incomeVsExpenses')}</div></div></div>
          {trends.length > 0 ? <div className="chart-container"><Line data={trendsData} options={chartOpts} /></div>
          : <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">{t('addTransactionsToSeeTrends')}</div></div>}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">{t('expenseBreakdown')}</div><div className="card-subtitle">{getMonthName(month)} {year}</div></div></div>
          {breakdown.length > 0 ? <div className="chart-container"><Doughnut data={doughnutData} options={doughnutOpts} /></div>
          : <div className="empty-state"><div className="empty-state-icon">🍩</div><div className="empty-state-text">{t('noExpenseData')}</div></div>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><div><div className="card-title">{t('incomeVsExpensesTitle')}</div><div className="card-subtitle">{getMonthName(month)} {year}</div></div></div>
        <div className="chart-container" style={{ height: 200 }}><Bar data={barData} options={chartOpts} /></div>
      </div>

      {breakdown.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><div className="card-title">{t('categoryDetails')}</div></div>
          <div className="table-container"><table className="table">
            <thead><tr><th>{t('category')}</th><th>{t('transactionsCol')}</th><th>{t('total')}</th><th>{t('ofTotal')}</th></tr></thead>
            <tbody>{(() => {
              const tot = breakdown.reduce((s, b) => s + b.total, 0);
              return breakdown.map((item) => {
                const pct = tot > 0 ? ((item.total / tot) * 100).toFixed(1) : 0;
                return (<tr key={item.category_id}>
                  <td><span style={{ marginRight: 8 }}>{item.category_icon}</span>{item.category_name}</td>
                  <td>{item.count}</td><td className="amount-expense">{formatCurrency(item.total)}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="progress-bar-container" style={{ width: 80 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div><span style={{ fontSize: 13 }}>{pct}%</span></div></td>
                </tr>);
              });
            })()}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
