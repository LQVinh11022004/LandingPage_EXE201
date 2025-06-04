import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Download from './components/Download';
import Dashboard from './components/Dashboard';
import { AuthProvider, AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Experts from './components/Experts';
import Login from './components/Login';
import ServicePackage from './components/ServicePackage';
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
              <>
                <Hero />
                <Features />
                <Download />
              </>
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
        >
          <Route path="experts" element={<Experts />} />
          <Route path="service-packages" element={<ServicePackage />} />
        </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}



export default App;