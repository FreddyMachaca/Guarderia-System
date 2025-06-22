import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApi } from './hooks/useApi';
import Dashboard from './pages/dashboard/Dashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import GestionNinos from './pages/gestionNinos/GestionNinos';
import './System.css';

const AppSystem = () => {
  const { isAuthenticated, getCurrentUser } = useApi();

  if (!isAuthenticated()) {
    return <Navigate to="/portal" replace />;
  }

  const user = getCurrentUser();
  const userType = user?.type;

  return (
    <div className="app-system system">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/gestion-ninos" element={<GestionNinos />} />
        
        <Route path="/" element={
          userType === 'parent' ? 
            <Navigate to="/system/parent" replace /> : 
            <Navigate to="/system/dashboard" replace />
        } />
      </Routes>
    </div>
  );
};

export default AppSystem;