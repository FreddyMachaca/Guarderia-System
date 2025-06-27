import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApi } from './hooks/useApi';
import Dashboard from './pages/dashboard/Dashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import GestionNinos from './pages/gestionNinos/GestionNinos';
import GestionGrupos from './pages/grupos/GestionGrupos';
import GestionPadres from './pages/gestionPadres/GestionPadres';
import GestionPersonal from './pages/gestionPersonal/GestionPersonal';
import GestionMensualidades from './pages/gestionMensualidades/GestionMensualidades';
import GestionReportes from './pages/reportes/GestionReportes';
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
        <Route path="/grupos" element={<GestionGrupos />} />
        <Route path="/padres" element={<GestionPadres />} />
        <Route path="/personal" element={<GestionPersonal />} />
        <Route path="/mensualidades" element={<GestionMensualidades />} />
        <Route path="/reportes" element={<GestionReportes />} />
        
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