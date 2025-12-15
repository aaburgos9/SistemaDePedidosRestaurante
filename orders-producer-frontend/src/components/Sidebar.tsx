import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineCog,
  HiOutlineChatAlt2
} from 'react-icons/hi';

const menu = [
  { to: '/admin/dashboard', icon: <HiOutlineHome size={22} />, label: 'Panel Principal' },
  { to: '/admin/products', icon: <HiOutlineCube size={22} />, label: 'Productos' },
  { to: '/admin/users', icon: <HiOutlineUserGroup size={22} />, label: 'Usuarios' },
  { to: '/admin/settings', icon: <HiOutlineCog size={22} />, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="h-screen w-64 bg-[#18181b] text-white flex flex-col shadow-xl fixed top-0 left-0 z-30">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
        <span className="bg-orange-500 rounded-lg p-2">
          <HiOutlineCube size={28} />
        </span>
        <span className="font-bold text-lg tracking-tight">Rápido y Sabroso</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menu.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-base hover:bg-zinc-700/80 ${location.pathname.startsWith(item.to) ? 'bg-zinc-800' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => {
            // Cerrar sesión: limpiar storage y recargar
            localStorage.clear();
            window.location.href = '/admin';
          }}
          className={
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-base hover:bg-zinc-700/80 w-full text-left'
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3H9m6-3l3 3-3 3" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
