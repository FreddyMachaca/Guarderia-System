import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import ListaReportes from './ListaReportes';
import FormularioReporte from './FormularioReporte';
import UserProfileMenu from '../../components/UserProfileMenu';
import './GestionReportes.css';
import 'primeicons/primeicons.css';

const GestionReportes = () => {
  const { getCurrentUser, logout } = useApi();
  const { adminMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleGenerarReporte = (tipoReporte) => {
    setReporteSeleccionado(tipoReporte);
    setVista('formulario');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setReporteSeleccionado(null);
  };

  return (
    <div className="rpt-gestion-reportes">
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
            <h1>Gestión de Reportes</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="rpt-gestion-content">
          {vista === 'lista' ? (
            <ListaReportes 
              onGenerarReporte={handleGenerarReporte}
            />
          ) : (
            <FormularioReporte 
              tipoReporte={reporteSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionReportes;