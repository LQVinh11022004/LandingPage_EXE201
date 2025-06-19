import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-pink-100 text-pink-800 py-4 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold flex items-center"
        >
          <span role="img" aria-label="baby">
            <img src="./logo_exe201.jpg" alt="logo" className="h-10 w-auto" /> {/* Thu nhỏ logo */}
          </span> 
          Mom&Baby
        </motion.div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
        <ul className={`md:flex md:space-x-6 ${isOpen ? 'block' : 'hidden'} md:block absolute md:static top-16 left-0 w-full md:w-auto bg-pink-100 md:bg-transparent p-4 md:p-0 transition-all duration-300`}>
          <li><Link to="/" className="block py-2 md:py-0 hover:text-pink-500 transition-colors">Trang chủ</Link></li>
          {/* <li><Link to="/features" className="block py-2 md:py-0 hover:text-pink-500 transition-colors">Sản phẩm</Link></li> */}
          <li><Link to="/download" className="block py-2 md:py-0 hover:text-pink-500 transition-colors">Tải Ứng Dụng</Link></li>
          <li><Link to="/dashboard" className="block py-2 md:py-0 hover:text-pink-500 transition-colors">Dashboard</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;