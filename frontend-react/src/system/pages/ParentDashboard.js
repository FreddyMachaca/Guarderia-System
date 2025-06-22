import React from 'react';
import './Dashboard.css';
import { useApi } from '../hooks/useApi';
import { useMenus } from '../hooks/useMenus';
import 'primeicons/primeicons.css';

const ParentDashboard = () => {
  const { getCurrentUser, logout } = useApi();
  const { parentMenus, activeMenu, setMenu } = useMenus();
  const user = getCurrentUser();

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Nombre</span>
          </div>
          <div className="sidebar-subtitle">Portal de Padres</div>
        </div>
        
        <nav className="sidebar-menu">
          {parentMenus.map(menu => (
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

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Portal de Padres</h1>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">Bienvenido, {user?.name}</div>
              <div className="user-role">Padre/Madre</div>
            </div>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Mis Hijos</h3>
              <div className="card-value">0</div>
              <div className="card-description">Niños registrados</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Mensajes</h3>
              <div className="card-value">0</div>
              <div className="card-description">Nuevos mensajes</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Pagos Pendientes</h3>
              <div className="card-value">$0</div>
              <div className="card-description">Montos por pagar</div>
            </div>
            
            <div className="dashboard-card">
              <h3>Próximos Eventos</h3>
              <div className="card-value">0</div>
              <div className="card-description">Eventos programados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;