import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import AIFloatingWidget from '../components/AIFloatingWidget';
import piggyRed   from '../assets/piggy_hero.png';
import piggyPink  from '../assets/piggy_pink.png';
import piggyWinter from '../assets/piggy_winter.png';

ChartJS.register(ArcElement, Tooltip, Legend);

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getChartPalette(accentHex) {
  return [
    accentHex,
    '#8b5cf6','#a78bfa','#c4b5fd',
    '#22c55e','#f59e0b','#f87171',
    '#3b82f6','#14b8a6','#f97316','#06b6d4','#e879f9',
  ];
}

/* ─── Typewriter hook (white subtitle, like "For Video Editors_") ─── */
const SUBTITLES = [
  'For Your Finances.',
  'Track Every Rupee.',
  'Your Money, Your Way.',
  'Save Smarter Today.',
];

function useTypewriter(words, typeSpeed = 110, deleteSpeed = 55, pause = 2000) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx,   setWordIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
  const [deleting,  setDeleting]  = useState(false);
  const [waiting,   setWaiting]   = useState(false);

  useEffect(() => {
    if (waiting) return;
    const current = words[wordIdx];

    if (!deleting) {
      // Typing
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, typeSpeed);
        return () => clearTimeout(t);
      } else {
        // Pause before deleting
        setWaiting(true);
        const t = setTimeout(() => {
          setWaiting(false);
          setDeleting(true);
        }, pause);
        return () => clearTimeout(t);
      }
    } else {
      // Deleting
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        }, deleteSpeed);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setWordIdx(w => (w + 1) % words.length);
      }
    }
  }, [charIdx, deleting, waiting, wordIdx, words, typeSpeed, deleteSpeed, pause]);

  return displayed;
}

export default function DashboardPage() {
  const { user }             = useAuth();
  const { t }                = useLanguage();
  const { formatCurrency }   = useCurrency();
  const { theme }            = useTheme();
  const [summary,      setSummary]      = useState(null);
  const [breakdown,    setBreakdown]    = useState([]);
  const [recentTx,     setRecentTx]     = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const statsRef = useRef(null);

  /* typewriter on the white subtitle line */
  const subtitleText = useTypewriter(SUBTITLES);

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
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const scrollToStats = () =>
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  /* Pick hero image + derive theme accent */
  const accent = theme?.accent || '#FF4141';
  const CHART_COLORS = getChartPalette(accent);
  const HERO_IMAGES = { ronin: piggyRed, sakura: piggyPink, winter: piggyWinter };
  const heroImg = HERO_IMAGES[theme?.id] || piggyRed;

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const doughnutData = {
    labels: breakdown.map(b => b.category_name),
    datasets: [{
      data: breakdown.map(b => b.total),
      backgroundColor: CHART_COLORS.slice(0, breakdown.length),
      borderWidth: 0, hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.45)',
          padding: 16, usePointStyle: true, pointStyleWidth: 8,
          font: { family: "'Outfit','Inter',sans-serif", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(8,8,8,0.92)',
        titleColor: '#FFFFFF',
        bodyColor: 'rgba(255,255,255,0.55)',
        borderColor: accent + '44',
        borderWidth: 1, cornerRadius: 10, padding: 14,
        callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` },
      },
    },
  };

  const alertBudgets = budgetStatus.filter(b => b.alert);

  return (
    <div style={{ margin: '-28px -36px' }}>

      {/* ══════════════════════════════════════════ */}
      {/*  HERO — RoninFX style                     */}
      {/* ══════════════════════════════════════════ */}
      <section className="dash-hero">

        {/* Full-bg hero image — swaps per theme */}
        <img src={heroImg} className="dash-hero-bg" alt="" aria-hidden="true" />

        {/* Dark vignette + themed ambient glow */}
        <div className="dash-hero-glow" style={theme?.heroGlow ? { background: theme.heroGlow } : {}} />

        {/* Dot grid overlay */}
        <div className="dash-hero-grid" />

        {/* ── Hero content ── */}
        <div className="dash-hero-content">

          {/* • INSTANT DOWNLOAD badge style */}
          <div className="dash-hero-badge">
            SMART FINANCE
          </div>

          {/* Main title block */}
          <h1 className="dash-hero-title">
            {/* Line 1 — big accent-colored, static */}
            <span className="dash-hero-title-red" style={{ color: theme?.heroTitleColor || '#FF4141', fontFamily: theme?.fontFamily }}>
              Paise Kaha
            </span>

            {/* Line 2 — white typewriter + blinking cursor */}
            <span className="dash-hero-subtitle-line" style={{ fontFamily: theme?.fontFamily }}>
              {subtitleText}
              <span className="dash-hero-cursor" style={{ color: theme?.heroCursorColor || '#FF4141' }}>_</span>
            </span>
          </h1>

          {/* Body description — muted gray like RoninFX */}
          <p className="dash-hero-sub">
            High-quality finance tracking.{' '}
            <strong>Real-time insights</strong>,{' '}
            <strong>smart budgets</strong>, ready to use.
          </p>

          {/* CTA buttons */}
          <div className="dash-hero-actions">
            <Link to="/transactions" className="dash-hero-btn-primary">
              Browse Transactions &nbsp;→
            </Link>
            <button className="dash-hero-btn-secondary" onClick={scrollToStats}>
              View Dashboard
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="dash-hero-scroll" onClick={scrollToStats} title="Scroll to dashboard">
          <div className="dash-hero-scroll-dot" />
        </div>
      </section>

      {/* ══════════════════════════════════════════ */}
      {/*  STATS SECTION (below fold)               */}
      {/* ══════════════════════════════════════════ */}
      <div ref={statsRef} className="dash-main fade-in">

        {/* Stat cards */}
        <div className="stat-cards" style={{ marginBottom: 24 }}>
          <div className="card stat-card balance">
            <div className="stat-icon-clean balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
            <div className="stat-label">{t('currentBalance')}</div>
            <div className="stat-value">{formatCurrency(summary?.all_time?.balance)}</div>
          </div>
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
            <div className="stat-label">{t('monthlyExpense')}</div>
            <div className="stat-value expense-color">{formatCurrency(summary?.monthly?.expense)}</div>
          </div>
          <div className="card stat-card transactions">
            <div className="stat-icon-clean transactions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
            <div className="stat-label">{t('totalTransactions')}</div>
            <div className="stat-value">{summary?.transaction_count || 0}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{t('expenseBreakdown')}</div>
                <div className="card-subtitle">{t('currentMonthByCategory')}</div>
              </div>
            </div>
            {breakdown.length > 0 ? (
              <div className="chart-container">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
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
                {recentTx.map(tx => (
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

        {/* Budget alerts */}
        {alertBudgets.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <div>
                <div className="card-title">{t('budgetAlerts')}</div>
                <div className="card-subtitle">{t('categoriesApproaching')}</div>
              </div>
              <Link to="/budgets" className="btn btn-secondary btn-sm">{t('manageBudgets')}</Link>
            </div>
            <div className="budget-grid">
              {alertBudgets.map(b => (
                <div key={b.id} className="budget-card" style={{ padding: 0 }}>
                  <div className="budget-card-header">
                    <div className="budget-category">
                      <span className="budget-category-icon">{b.category_icon}</span>
                      <span className="budget-category-name">{b.category_name}</span>
                    </div>
                    <div className="budget-percentage"
                      style={{ color: b.alert === 'exceeded' ? 'var(--danger)' : 'var(--warning)' }}>
                      {b.percentage}%
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${b.alert === 'exceeded' ? 'danger' : 'warning'}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
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
      </div>

      <AIFloatingWidget />
    </div>
  );
}
