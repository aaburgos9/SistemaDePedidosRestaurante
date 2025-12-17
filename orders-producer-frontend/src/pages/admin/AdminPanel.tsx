
import React from 'react';
import { useAuth } from '../../store/auth';
// import { Navigate } from 'react-router-dom';

import UsersPage from './UsersPage';
import ProductsPage from './ProductsPage';
import DashboardPage from './DashboardPage';
import SettingsPage from './SettingsPage';
import Sidebar from '../../components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  console.log('🔍 AdminPanel render:', { isAuthenticated, user });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto px-8 py-8">
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Redirección por defecto a dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
