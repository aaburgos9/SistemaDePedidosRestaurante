import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WaiterPage } from './pages/WaiterPage';
import { KitchenPage } from './pages/KitchenPage';
import AdminPanel from './pages/admin/AdminPanel';
import Login from './pages/admin/Login';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mesero" element={<WaiterPage />} />
        <Route path="/cocina" element={<KitchenPage />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
