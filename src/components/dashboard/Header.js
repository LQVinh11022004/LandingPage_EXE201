import React from 'react';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ isSidebarOpen, toggleSidebar, location }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const getTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/dashboard/experts') return 'Experts List';
    if (location.pathname === '/dashboard/service-packages') return 'Service Packages';
    return 'Dashboard';
  };

  return (
    <header className="bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md fixed top-0 left-0 right-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="text-white text-2xl mr-4 focus:outline-none"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-pink-700 hover:bg-pink-900 px-4 py-2 rounded-lg transition duration-200"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;