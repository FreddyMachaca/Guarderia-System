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
import MisHijos from './pages/misHijos/MisHijos';
import PerfilUsuario from './pages/perfil/PerfilUsuario';
import './System.css';

const AppSystem = () => {
  const { isAuthenticated, getCurrentUser } = useApi();

  if (!isAuthenticated()) {
    return <Navigate to="/portal" replace />;
  }

  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/portal" replace />;
  }

  const userType = user?.type || user?.usr_tipo;

  return (
    <div className="app-system system">
      <Routes>
        {/* Rutas para administradores y personal */}
        {(userType === 'admin' || userType === 'personal' || userType === 'staff') && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gestion-ninos" element={<GestionNinos />} />
            <Route path="/grupos" element={<GestionGrupos />} />
            <Route path="/padres" element={<GestionPadres />} />
            <Route path="/personal" element={<GestionPersonal />} />
            <Route path="/mensualidades" element={<GestionMensualidades />} />
            <Route path="/reportes" element={<GestionReportes />} />
          </>
        )}
        
        {/* Rutas para padres/tutores */}
        {(userType === 'parent' || userType === 'Tutor') && (
          <>
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/mis-hijos" element={<MisHijos />} />
          </>
        )}
        
        {/* Ruta de perfil disponible para todos */}
        <Route path="/perfil" element={<PerfilUsuario />} />
        
        <Route path="/" element={
          userType === 'parent' || userType === 'Tutor' ? 
            <Navigate to="/system/parent-dashboard" replace /> : 
            <Navigate to="/system/dashboard" replace />
        } />
      </Routes>
    </div>
  );
};

export default AppSystem;