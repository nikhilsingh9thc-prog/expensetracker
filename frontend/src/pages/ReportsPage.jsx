import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const getMonthName = (m) => MONTHS[m - 1];

/* Read a CSS variable from :root at runtime */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Build chart color palette blended with theme accent */
function getChartPalette(accentHex) {
  return [
    accentHex,
    '#8b5cf6', '#a78bfa', '#c4b5fd',
    '#22c55e', '#f59e0b', '#f87171',
    '#3b82f6', '#14b8a6', '#f97316', '#06b6d4', '#e879f9',
  ];
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { theme } = useTheme();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [summary,   setSummary]   = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [trends,    setTrends]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  const accent   = theme?.accent  || getCSSVar('--accent-primary') || '#FF4141';
  const accentLow = accent + '22'; // 13% opacity for fills
  const CHART_COLORS = getChartPalette(accent);

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

  /* ── Chart shared options ── */
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.55)',
          font: { family: "'Outfit','Inter',sans-serif", size: 12 },
          usePointStyle: true, pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(8,8,8,0.92)',
        titleColor: '#FFFFFF',
        bodyColor: 'rgba(255,255,255,0.60)',
        borderColor: accent + '44',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 14,
        callbacks: { label: (ctx) => ` ${ctx.label || ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 }, callback: (v) => formatCurrency(v) },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };

  /* ── Spending trends line chart — income green, expense = theme accent ── */
  const trendsData = {
    labels: trends.map((tr) => {
      const [y, m] = tr.month.split('-');
      return getMonthName(parseInt(m)).substring(0, 3) + ' ' + y.substring(2);
    }),
    datasets: [
      {
        label: t('income'),
        data: trends.map((tr) => tr.income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true, tension: 0.45,
        pointRadius: 5, pointBackgroundColor: '#22c55e',
        borderWidth: 2,
      },
      {
        label: t('expense'),
        data: trends.map((tr) => tr.expense),
        borderColor: accent,
        backgroundColor: accentLow,
        fill: true, tension: 0.45,
        pointRadius: 5, pointBackgroundColor: accent,
        borderWidth: 2,
      },
    ],
  };

  /* ── Doughnut — theme-blended palette ── */
  const doughnutData = {
    labels: breakdown.map((b) => b.category_name),
    datasets: [{
      data: breakdown.map((b) => b.total),
      backgroundColor: CHART_COLORS.slice(0, breakdown.length),
      borderWidth: 0, hoverOffset: 10,
    }],
  };
  const doughnutOpts = {
    ...chartOpts,
    cutout: '65%',
    scales: undefined,
    plugins: {
      ...chartOpts.plugins,
      legend: { position: 'bottom', labels: chartOpts.plugins.legend.labels },
    },
  };

  /* ── Bar chart — theme accent for expense ── */
  const barData = {
    labels: [getMonthName(month) + ' ' + year],
    datasets: [
      {
        label: t('income'),
        data: [summary?.monthly?.income || 0],
        backgroundColor: 'rgba(34,197,94,0.75)',
        borderRadius: 8, barPercentage: 0.5,
        borderSkipped: false,
      },
      {
        label: t('expense'),
        data: [summary?.monthly?.expense || 0],
        backgroundColor: accent + 'BB',
        borderRadius: 8, barPercentage: 0.5,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reportsAnalytics')}</h1>
          <p className="page-description">{t('visualizeData')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>{t('exportCSV')}</button>
      </div>

      {/* Month / Year filters */}
      <div className="filters-bar">
        <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
        </select>
        <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards — NO emoji icons, clean SVG indicators */}
      <div className="stat-cards">
        <div className="card stat-card income">
          <div className="stat-icon-clean income">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div className="stat-label">{t('monthlyIncome')}</div>
          <div className="stat-value income-color">{formatCurrency(summary?.monthly?.income)}</div>
        </div>
        <div className="card stat-card expense">
          <div className="stat-icon-clean expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
            </svg>
          </div>
          <div className="stat-label">{t('monthlyExpenses')}</div>
          <div className="stat-value expense-color">{formatCurrency(summary?.monthly?.expense)}</div>
        </div>
        <div className="card stat-card balance">
          <div className="stat-icon-clean balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-label">{t('netSavings')}</div>
          <div className="stat-value" style={{ color: (summary?.monthly?.balance || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(summary?.monthly?.balance)}
          </div>
        </div>
      </div>

      {/* Yearly summary card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">{t('yearlySummary')} ({year})</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div>
            <div className="stat-label">{t('totalIncome')}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{formatCurrency(summary?.yearly?.income)}</div>
          </div>
          <div>
            <div className="stat-label">{t('totalExpenses')}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{formatCurrency(summary?.yearly?.expense)}</div>
          </div>
          <div>
            <div className="stat-label">{t('netBalance')}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: (summary?.yearly?.balance || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
              {formatCurrency(summary?.yearly?.balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">{t('spendingTrends')}</div><div className="card-subtitle">{t('incomeVsExpenses')}</div></div>
          </div>
          {trends.length > 0
            ? <div className="chart-container"><Line data={trendsData} options={chartOpts} /></div>
            : <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">{t('addTransactionsToSeeTrends')}</div></div>
          }
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">{t('expenseBreakdown')}</div><div className="card-subtitle">{getMonthName(month)} {year}</div></div>
          </div>
          {breakdown.length > 0
            ? <div className="chart-container"><Doughnut data={doughnutData} options={doughnutOpts} /></div>
            : <div className="empty-state"><div className="empty-state-icon">🍩</div><div className="empty-state-text">{t('noExpenseData')}</div></div>
          }
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div><div className="card-title">{t('incomeVsExpensesTitle')}</div><div className="card-subtitle">{getMonthName(month)} {year}</div></div>
        </div>
        <div className="chart-container" style={{ height: 200 }}><Bar data={barData} options={chartOpts} /></div>
      </div>

      {/* Category table */}
      {breakdown.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><div className="card-title">{t('categoryDetails')}</div></div>
          <div className="table-container"><table className="table">
            <thead><tr><th>{t('category')}</th><th>{t('transactionsCol')}</th><th>{t('total')}</th><th>{t('ofTotal')}</th></tr></thead>
            <tbody>{(() => {
              const tot = breakdown.reduce((s, b) => s + b.total, 0);
              return breakdown.map((item, idx) => {
                const pct = tot > 0 ? ((item.total / tot) * 100).toFixed(1) : 0;
                return (<tr key={item.category_id}>
                  <td>
                    <span style={{
                      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                      background: CHART_COLORS[idx % CHART_COLORS.length], marginRight: 8,
                    }} />
                    {item.category_name}
                  </td>
                  <td>{item.count}</td>
                  <td className="amount-expense">{formatCurrency(item.total)}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar-container" style={{ width: 80 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    </div>
                    <span style={{ fontSize: 13 }}>{pct}%</span>
                  </div></td>
                </tr>);
              });
            })()}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
