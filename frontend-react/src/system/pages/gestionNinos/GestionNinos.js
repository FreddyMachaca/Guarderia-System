import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import FormularioNino from './FormularioNino';
import ListaNinos from './ListaNinos';
import './GestionNinos.css';
import 'primeicons/primeicons.css';

const GestionNinos = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleAgregarNino = () => {
    setNinoSeleccionado(null);
    setVista('formulario');
  };

  const handleEditarNino = (nino) => {
    setNinoSeleccionado(nino);
    setVista('formulario');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setNinoSeleccionado(null);
  };

  return (
    <div className="gestion-ninos">
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
            <h1>Gestión de Niños</h1>
          </div>
          <div className="header-right">
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
          </div>
        </header>
        
        <div className="gestion-content">
          {vista === 'lista' ? (
            <ListaNinos 
              onAgregarNino={handleAgregarNino}
              onEditarNino={handleEditarNino}
            />
          ) : (
            <FormularioNino 
              nino={ninoSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionNinos;