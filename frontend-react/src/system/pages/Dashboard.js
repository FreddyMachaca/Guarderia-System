import React from 'react';
import './Dashboard.css';
import { useApi } from '../hooks/useApi';

const Dashboard = () => {
  const { getCurrentUser, logout } = useApi();
  const user = getCurrentUser();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Niños Registrados</h3>
            <div className="card-value">0</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Personal Activo</h3>
            <div className="card-value">0</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Padres Registrados</h3>
            <div className="card-value">0</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Actividades Hoy</h3>
            <div className="card-value">0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;