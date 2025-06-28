import React, { useState, useEffect } from 'react';
import DashboardAnalytics from './DashboardAnalytics';
import UserProfileMenu from '../../components/UserProfileMenu';
import './Dashboard.css';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import 'primeicons/primeicons.css';

const Dashboard = () => {
  const { getCurrentUser, logout, get } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [dashboardStats, setDashboardStats] = useState({
    ninos: 0,
    personal: 0,
    padres: 0,
    actividades: 0
  });
  const user = getCurrentUser();

  useEffect(() => {
    cargarEstadisticasBasicas();
  }, []);

  const cargarEstadisticasBasicas = async () => {
    try {
      const response = await get('/dashboard/estadisticas-basicas');
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className={`dashboard-sidebar ${!isMenuOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Guardería</span>
          </div>
          <div className="sidebar-subtitle">Panel de Administración</div>
        </div>
        
        <nav className="sidebar-menu">
          {adminMenus.map(menu => (
            <button
              key={menu.id}
              className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
              onClick={() => setMenu(menu.id)}
            >
              <i className={`menu-icon ${menu.icon}`} />
              {menu.title}
            </button>
          ))}
        </nav>
      </div>

      <div className={`dashboard-main ${!isMenuOpen ? 'expanded' : ''}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className="pi pi-bars" />
            </button>
            <h1>Dashboard Analítico</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="dashboard-content">
          <DashboardAnalytics />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;