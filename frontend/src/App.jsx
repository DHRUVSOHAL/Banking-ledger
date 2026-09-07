import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './features/auth/pages/Home';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import AccountHistory from './features/dashboard/pages/AccountHistory'; // 👈 Account history component
import Transfer from './features/transfer/pages/Transfer';
import PendingDeposits from './features/admin/pages/PendingDeposits';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:accountId/history"
            element={
              <ProtectedRoute>
                <AccountHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute>
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <ProtectedRoute>
                <PendingDeposits />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}