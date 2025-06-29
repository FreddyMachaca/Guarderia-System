import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import ListaMisHijos from './ListaMisHijos';
import ViewMiHijo from './ViewMiHijo';
import './MisHijos.css';
import 'primeicons/primeicons.css';

const MisHijos = () => {
  const { getCurrentUser, logout } = useApi();
  const { parentMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [hijoSeleccionado, setHijoSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleVerHijo = (hijo) => {
    setHijoSeleccionado(hijo);
    setVista('detalle');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setHijoSeleccionado(null);
  };

  return (
    <div className="mis-hijos-module">
      <div className={`mis-hijos-sidebar ${!isMenuOpen ? 'collapsed' : ''}`}>
        <div className="mis-hijos-sidebar-header">
          <div className="mis-hijos-sidebar-logo">
            <span>Guardería</span>
          </div>
          <div className="mis-hijos-sidebar-subtitle">Portal de Padres</div>
        </div>
        
        <nav className="mis-hijos-sidebar-menu">
          {parentMenus.map(menu => (
            <button
              key={menu.id}
              className={`mis-hijos-menu-item ${activeMenu === menu.id ? 'active' : ''}`}
              onClick={() => setMenu(menu.id)}
            >
              <i className={`mis-hijos-menu-icon ${menu.icon}`} />
              {menu.title}
            </button>
          ))}
        </nav>
      </div>

      <div className={`mis-hijos-main ${!isMenuOpen ? 'expanded' : ''}`}>
        <header className="mis-hijos-header">
          <div className="mis-hijos-header-left">
            <button className="mis-hijos-menu-toggle" onClick={toggleMenu}>
              <i className="pi pi-bars" />
            </button>
            <h1>Mis Hijos</h1>
          </div>
          <div className="mis-hijos-header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="mis-hijos-content">
          {vista === 'lista' ? (
            <ListaMisHijos 
              onVerHijo={handleVerHijo}
            />
          ) : (
            <ViewMiHijo 
              hijo={hijoSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MisHijos;
