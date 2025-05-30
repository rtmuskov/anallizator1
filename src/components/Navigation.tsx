import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, Home, Menu, User, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { to: '/', label: 'Главная', icon: <Home size={20} /> },
    { to: '/data-entry', label: 'Ввод данных', icon: <ClipboardList size={20} /> },
    { to: '/reports', label: 'Отчёты', icon: <Activity size={20} /> },
    { to: '/profile', label: 'Профиль', icon: <User size={20} /> },
  ];

  return (
    <header className="bg-white shadow-nav sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Анализ InBody</span>
            </NavLink>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-1 py-2 text-sm font-medium transition-colors duration-200 
                  ${isActive 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'}`
                }
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            {isAuth && (
              <button
                onClick={logout}
                className="flex items-center px-1 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200 focus:outline-none"
              >
                <span className="mr-1.5"><LogOut size={20} /></span>
                Выйти
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Переключить меню"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            {isAuth && (
              <button
                onClick={() => { logout(); closeMenu(); }}
                className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-50 hover:text-primary-600 focus:outline-none"
              >
                <span className="mr-3"><LogOut size={20} /></span>
                Выйти
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation