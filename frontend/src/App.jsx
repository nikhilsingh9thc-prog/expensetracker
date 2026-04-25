import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import TopNav from './components/TopNav';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import SavingsGoalPage from './pages/SavingsGoalPage';
import CurrencyConverterPage from './pages/CurrencyConverterPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ProfilePage from './pages/ProfilePage';
import AIAssistantPage from './pages/AIAssistantPage';
import ExperienceSelectPage from './pages/ExperienceSelectPage';
import ClassicLayout from './pages/classic/ClassicLayout';
import ExperienceSwitchController from './components/ExperienceSwitchController';

function hasOnboarded(user) {
  if (!user) return false;
  return !!localStorage.getItem(`${user.username}_onboarding_done`);
}

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <ExperienceSwitchController />
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {hasOnboarded(user) ? <Navigate to="/" replace /> : <OnboardingPage />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience-select"
          element={
            <ProtectedRoute>
              <ExperienceSelectPage onSelect={(exp) => {
                // Navigation happens inside ExperienceSelectPage
              }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainRouter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function MainRouter() {
  const [experience, setExperience] = useState(() => localStorage.getItem('ui_experience'));
  const [transitionClass, setTransitionClass] = useState('initial-fade-in');

  useEffect(() => {
    // Synchronize body class for styling isolation
    document.body.classList.remove('mode-modern', 'mode-classic');
    if (experience) {
      document.body.classList.add(`mode-${experience}`);
    }

    const handleStorageChange = () => {
      const storedExp = localStorage.getItem('ui_experience');
      if (storedExp !== experience) {
        setExperience(storedExp);
      }
    };

    const handleExperienceChange = (e) => {
      const newExp = e.detail?.newExp || localStorage.getItem('ui_experience');
      const oldExp = experience;
      
      if (oldExp === 'modern' && newExp === 'classic') {
        setTransitionClass('transition-modern-to-classic');
      } else if (oldExp === 'classic' && newExp === 'modern') {
        setTransitionClass('transition-classic-to-modern');
      }

      setExperience(newExp);
      
      // Reset transition class after animation completes
      setTimeout(() => setTransitionClass(''), 800);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('experience_change', handleExperienceChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('experience_change', handleExperienceChange);
    };
  }, [experience]);

  if (!experience) {
    return <Navigate to="/experience-select" replace />;
  }

  if (experience === 'classic') {
    return (
      <div className={transitionClass}>
        <ClassicLayout />
      </div>
    );
  }

  return (
    <div className={`app-topnav-layout ${transitionClass}`}>
      <TopNav />
      <main className="topnav-main-content">
        <Routes>
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets"      element={<BudgetsPage />} />
          <Route path="/savings"      element={<SavingsGoalPage />} />
          <Route path="/reports"      element={<ReportsPage />} />
          <Route path="/converter"    element={<CurrencyConverterPage />} />
          <Route path="/help"         element={<HelpCenterPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/assistant"    element={<AIAssistantPage />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
          {splashDone && (
            <Router>
              <AuthProvider>
                <AppLayout />
              </AuthProvider>
            </Router>
          )}
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
