import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import FormularioPersonal from './FormularioPersonal';
import ListaPersonal from './ListaPersonal';
import ViewPersonal from './ViewPersonal';
import './GestionPersonal.css';
import 'primeicons/primeicons.css';

const GestionPersonal = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [personalSeleccionado, setPersonalSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleAgregarPersonal = () => {
    setPersonalSeleccionado(null);
    setVista('formulario');
  };

  const handleEditarPersonal = (personal) => {
    setPersonalSeleccionado(personal);
    setVista('formulario');
  };
  
  const handleVerPersonal = (personal) => {
    setPersonalSeleccionado(personal);
    setVista('detalle');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setPersonalSeleccionado(null);
  };

  return (
    <div className="gestion-personal">
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
            <h1>Gestión de Personal</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="gestion-content">
          {vista === 'lista' ? (
            <ListaPersonal 
              onAgregarPersonal={handleAgregarPersonal}
              onEditarPersonal={handleEditarPersonal}
              onVerPersonal={handleVerPersonal}
            />
          ) : vista === 'formulario' ? (
            <FormularioPersonal 
              personal={personalSeleccionado}
              onVolver={handleVolverLista}
            />
          ) : (
            <ViewPersonal 
              empleado={personalSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionPersonal;
      