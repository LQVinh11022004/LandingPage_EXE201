import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Credentials:', { userName, password });
    try {
      await login(userName, password, navigate);
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-pink-800 mb-6 text-center">
          Đăng Nhập
        </h1>
        {error && (
          <div className="mb-4 text-red-600 text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 text-white p-2 rounded-md hover:bg-pink-700 transition"
          >
            Đăng Nhập
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;