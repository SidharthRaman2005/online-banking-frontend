import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AppLayout from '../layouts/AppLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/user/Dashboard';
import MoneyForm from '../pages/user/MoneyForm';
import Transfer from '../pages/user/Transfer';
import TransactionHistory from '../pages/user/TransactionHistory';
import Profile from '../pages/user/Profile';
import Notifications from '../pages/user/Notifications';
import Loan from '../pages/user/Loan';
import FD from '../pages/user/FD';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAccounts from '../pages/admin/AdminAccounts';
import AdminTransactions from '../pages/admin/AdminTransactions';
import AdminActivationRequests from '../pages/admin/AdminActivationRequests';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute userOnly />}>
        <Route element={<AppLayout variant="user" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposit" element={<MoneyForm mode="deposit" />} />
          <Route path="/withdraw" element={<MoneyForm mode="withdraw" />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/fd" element={<FD />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AppLayout variant="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/activation-requests" element={<AdminActivationRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
