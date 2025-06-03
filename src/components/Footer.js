import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đã đăng ký với email: ${email}`);
    setEmail('');
  };

  return (
    <footer id="contact" className="bg-pink-100 text-pink-800 py-8">
      <div className="container mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email để nhận ưu đãi"
            className="p-2 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="bg-pink-500 text-white p-2 rounded-r-md hover:bg-pink-600 transition"
          >
            Đăng Ký
          </motion.button>
        </motion.div>
        <p className="mb-4">© 2025 Mẹ & Bé Shop. All rights reserved.</p>
        <div className="flex justify-center space-x-4">
          <motion.a
            href="#"
            whileHover={{ scale: 1.1 }}
            className="hover:text-pink-500 transition-colors"
          >
            Facebook
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.1 }}
            className="hover:text-pink-500 transition-colors"
          >
            Instagram
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.1 }}
            className="hover:text-pink-500 transition-colors"
          >
            Zalo
          </motion.a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;