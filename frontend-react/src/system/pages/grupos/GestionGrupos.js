import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import FormularioGrupo from './FormularioGrupo';
import ListaGrupos from './ListaGrupos';
import ViewGrupo from './ViewGrupo';
import './GestionGrupos.css';
import 'primeicons/primeicons.css';

const GestionGrupos = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleAgregarGrupo = () => {
    setGrupoSeleccionado(null);
    setVista('formulario');
  };

  const handleEditarGrupo = (grupo) => {
    setGrupoSeleccionado(grupo);
    setVista('formulario');
  };
  
  const handleVerGrupo = (grupo) => {
    setGrupoSeleccionado(grupo);
    setVista('detalle');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setGrupoSeleccionado(null);
  };

  return (
    <div className="gestion-grupos">
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
            <h1>Gestión de Grupos/Aulas</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="gestion-content">
          {vista === 'lista' ? (
            <ListaGrupos 
              onAgregarGrupo={handleAgregarGrupo}
              onEditarGrupo={handleEditarGrupo}
              onVerGrupo={handleVerGrupo}
            />
          ) : vista === 'formulario' ? (
            <FormularioGrupo 
              grupo={grupoSeleccionado}
              onVolver={handleVolverLista}
            />
          ) : (
            <ViewGrupo 
              grupo={grupoSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionGrupos;
