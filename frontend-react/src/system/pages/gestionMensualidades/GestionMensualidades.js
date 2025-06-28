import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import FormularioMensualidad from './FormularioMensualidad';
import ListaMensualidades from './ListaMensualidades';
import ViewMensualidad from './ViewMensualidad';
import RegistrarPago from './RegistrarPago';
import './GestionMensualidades.css';
import 'primeicons/primeicons.css';

const GestionMensualidades = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [mensualidadSeleccionada, setMensualidadSeleccionada] = useState(null);
  const [mensualidadNinoSeleccionada, setMensualidadNinoSeleccionada] = useState(null);
  const user = getCurrentUser();

  const handleAgregarMensualidad = () => {
    setMensualidadSeleccionada(null);
    setVista('formulario');
  };

  const handleEditarMensualidad = (mensualidad) => {
    setMensualidadSeleccionada(mensualidad);
    setVista('formulario');
  };
  
  const handleVerMensualidad = (mensualidad) => {
    setMensualidadSeleccionada(mensualidad);
    setVista('detalle');
  };

  const handleRegistrarPago = (mensualidadNino) => {
    setMensualidadNinoSeleccionada(mensualidadNino);
    setVista('pago');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setMensualidadSeleccionada(null);
    setMensualidadNinoSeleccionada(null);
  };

  return (
    <div className="gestion-mensualidades">
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
            <h1>Gestión de Mensualidades</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="gestion-content">
          {vista === 'lista' ? (
            <ListaMensualidades 
              onAgregarMensualidad={handleAgregarMensualidad}
              onEditarMensualidad={handleEditarMensualidad}
              onVerMensualidad={handleVerMensualidad}
            />
          ) : vista === 'formulario' ? (
            <FormularioMensualidad 
              mensualidad={mensualidadSeleccionada}
              onVolver={handleVolverLista}
            />
          ) : vista === 'detalle' ? (
            <ViewMensualidad 
              mensualidad={mensualidadSeleccionada}
              onVolver={handleVolverLista}
              onRegistrarPago={handleRegistrarPago}
            />
          ) : (
            <RegistrarPago 
              mensualidadNino={mensualidadNinoSeleccionada}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionMensualidades;
