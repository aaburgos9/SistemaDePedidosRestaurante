import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WaiterPage } from './pages/WaiterPage';
import { KitchenPage } from './pages/KitchenPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mesero" element={<WaiterPage />} />
        <Route path="/cocina" element={<KitchenPage />} />
      </Routes>
    </BrowserRouter>
  );
}
