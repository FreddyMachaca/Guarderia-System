import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import UserProfileMenu from '../../components/UserProfileMenu';
import ListaPagos from './ListaPagos';
import ViewPago from './ViewPago';
import './Pagos.css';
import 'primeicons/primeicons.css';

const Pagos = () => {
  const { getCurrentUser, logout } = useApi();
  const { parentMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [vista, setVista] = useState('lista');
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const user = getCurrentUser();

  const handleVerPago = (pago) => {
    setPagoSeleccionado(pago);
    setVista('detalle');
  };

  const handleVolverLista = () => {
    setVista('lista');
    setPagoSeleccionado(null);
  };

  return (
    <div className="pagos-module">
      <div className={`pagos-sidebar ${!isMenuOpen ? 'collapsed' : ''}`}>
        <div className="pagos-sidebar-header">
          <div className="pagos-sidebar-logo">
            <span>Guardería</span>
          </div>
          <div className="pagos-sidebar-subtitle">Portal de Padres</div>
        </div>
        
        <nav className="pagos-sidebar-menu">
          {parentMenus.map(menu => (
            <button
              key={menu.id}
              className={`pagos-menu-item ${activeMenu === menu.id ? 'active' : ''}`}
              onClick={() => setMenu(menu.id)}
            >
              <i className={`pagos-menu-icon ${menu.icon}`} />
              {menu.title}
            </button>
          ))}
        </nav>
      </div>

      <div className={`pagos-main ${!isMenuOpen ? 'expanded' : ''}`}>
        <header className="pagos-header">
          <div className="pagos-header-left">
            <button className="pagos-menu-toggle" onClick={toggleMenu}>
              <i className="pi pi-bars" />
            </button>
            <h1>Pagos</h1>
          </div>
          <div className="pagos-header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="pagos-content">
          {vista === 'lista' ? (
            <ListaPagos 
              onVerPago={handleVerPago}
            />
          ) : (
            <ViewPago 
              pago={pagoSeleccionado}
              onVolver={handleVolverLista}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagos;
