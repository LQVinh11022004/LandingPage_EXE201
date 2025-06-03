import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Download from './components/Download';
import Dashboard from './components/Dashboard';
import { AuthProvider, AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
                <><Hero /><Features /><Download /></>
            }
          />
          <Route path="/features" element={<Features />} />
          <Route path="/download" element={<Download />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect unauthenticated users to login
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;