import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import FormularioPadre from './FormularioPadre';
import ListaPadres from './ListaPadres';
import ViewPadres from './ViewPadres';
import './GestionPadres.css';
import 'primeicons/primeicons.css';

const GestionPadres = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [padreSeleccionado, setPadreSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleAgregarPadre = () => {
    setPadreSeleccionado(null);
    setVista('formulario');
  };

  const handleEditarPadre = (padre) => {
    setPadreSeleccionado(padre);
    setVista('formulario');
  };
  
  const handleVerPadre = (padre) => {
    setPadreSeleccionado(padre);
    setVista('detalle');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setPadreSeleccionado(null);
  };

  return (
    <div className="gestion-padres">
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
            <h1>Gestión de Padres/Tutores</h1>
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
            <ListaPadres 
              onAgregarPadre={handleAgregarPadre}
              onEditarPadre={handleEditarPadre}
              onVerPadre={handleVerPadre}
            />
          ) : vista === 'formulario' ? (
            <FormularioPadre 
              padre={padreSeleccionado}
              onVolver={handleVolverLista}
            />
          ) : (
            <ViewPadres 
              padre={padreSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionPadres;
