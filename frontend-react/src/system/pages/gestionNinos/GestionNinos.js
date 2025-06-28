import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import FormularioNino from './FormularioNino';
import ListaNinos from './ListaNinos';
import ViewNinos from './ViewNinos';
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
  
  const handleVerNino = (nino) => {
    setNinoSeleccionado(nino);
    setVista('detalle');
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
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="gestion-content">
          {vista === 'lista' ? (
            <ListaNinos 
              onAgregarNino={handleAgregarNino}
              onEditarNino={handleEditarNino}
              onVerNino={handleVerNino}
            />
          ) : vista === 'formulario' ? (
            <FormularioNino 
              nino={ninoSeleccionado}
              onVolver={handleVolverLista}
            />
          ) : (
            <ViewNinos 
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