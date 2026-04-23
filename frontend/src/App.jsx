import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import CurrencyConverterPage from './pages/CurrencyConverterPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ProfilePage from './pages/ProfilePage';
import AIAssistantPage from './pages/AIAssistantPage';

/** Check whether this user has already done onboarding */
function hasOnboarded(user) {
  if (!user) return false;
  return !!localStorage.getItem(`${user.username}_onboarding_done`);
}

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* ── Onboarding (protected, shown once) ── */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            {hasOnboarded(user) ? <Navigate to="/" replace /> : <OnboardingPage />}
          </ProtectedRoute>
        }
      />

      {/* ── Main app (protected) ── */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/converter" element={<CurrencyConverterPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/assistant" element={<AIAssistantPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <AppLayout />
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
