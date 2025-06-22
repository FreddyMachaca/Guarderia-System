import React from 'react';
import './Dashboard.css';
import { useApi } from '../hooks/useApi';
import { useMenus } from '../hooks/useMenus';

const Dashboard = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu } = useMenus();
  const user = getCurrentUser();

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Nombre</span>
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
              <span className="menu-icon">{menu.icon}</span>
              {menu.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Panel de Administración</h1>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">Bienvenido, {user?.name}</div>
              <div className="user-role">{user?.type === 'admin' ? 'Administrador' : 'Personal'}</div>
            </div>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Niños Registrados</h3>
              <div className="card-value">0</div>
              <div className="card-description">Total de niños activos</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Personal Activo</h3>
              <div className="card-value">0</div>
              <div className="card-description">Maestros y administradores</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Padres Registrados</h3>
              <div className="card-value">0</div>
              <div className="card-description">Familias en el sistema</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Actividades Hoy</h3>
              <div className="card-value">0</div>
              <div className="card-description">Programadas para hoy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;