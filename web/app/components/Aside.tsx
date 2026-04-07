import React, { use, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '~/Context/AppContext';

const navItems = [
  { label: 'Dashboard', to: '/', icon: 'bi-grid-1x2' },
  { label: 'Register Product', to: '/register', icon: 'bi-plus-circle' },
  { label: 'Product List', to: '/products', icon: 'bi-list-ul' },
  { label: 'Record Sale', to: '/record-sale', icon: 'bi-cart-plus' },
  { label: 'Sales', to: '/sales', icon: 'bi-graph-up-arrow' },
  { label: 'Verify Sales', to: '/verify', icon: 'bi-patch-check' },
  { label: 'Customers', to: '/customers', icon: 'bi-people' },
];

export default function Aside() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, set_isAdmin } = useAuth()
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const response = await fetch('http://127.0.0.1:8080/am_i_admin/', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        set_isAdmin(data.is_admin);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }
    fetchUserRole();
    fetchUserRole();
  }, []);
  if (!isAuthenticated) return null;
  return (
    <aside className="w-72 h-screen flex flex-col bg-white border-r border-gray-100 p-8 sticky top-0">
      {/* Brand Header */}
      <div className="mb-12 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">Msaidizi</span>
        </div>
      </div>

      <div className="mb-6 px-4">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Main Menu
        </h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            if (!isAdmin && (item.label === 'Verify Sales' || item.label === 'verify Sales')) {
              return null;
              }
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 '
                  }`}
                >
                  <i className={`bi ${item.icon} text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}></i>
                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="pt-6 border-t border-gray-50">
        <Link 
          to="/profile" 
          className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
            location.pathname === '/profile' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50 '
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
             <i className="bi bi-person-fill text-gray-400"></i>
          </div>
          <span className="text-sm font-bold">Settings</span>
        </Link>
      </div>
    </aside>
  );
}