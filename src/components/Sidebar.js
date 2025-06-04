import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserMd, FaBox } from 'react-icons/fa';

const Sidebar = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isSidebarOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-pink-100 to-pink-200 shadow-xl z-20"
    >
      <nav className="p-4 space-y-2">
        <h2 className="text-xl font-bold text-pink-800 mb-6">Admin Menu</h2>
        <a
          href="/dashboard"
          className={`flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200 ${
            location.pathname === '/dashboard' ? 'bg-pink-300' : ''
          }`}
        >
          <FaTachometerAlt className="text-lg" />
          <span>Dashboard</span>
        </a>
        <a
          href="/dashboard/experts"
          className={`flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200 ${
            location.pathname === '/dashboard/experts' ? 'bg-pink-300' : ''
          }`}
        >
          <FaUserMd className="text-lg" />
          <span>Experts</span>
        </a>
        <a
          href="/dashboard/service-packages"
          className={`flex items-center space-x-3 text-pink-700 hover:bg-pink-300 p-3 rounded-lg transition duration-200 ${
            location.pathname === '/dashboard/service-packages' ? 'bg-pink-300' : ''
          }`}
        >
          <FaBox className="text-lg" />
          <span>Service Packages</span>
        </a>
      </nav>
    </motion.div>
  );
};

export default Sidebar;