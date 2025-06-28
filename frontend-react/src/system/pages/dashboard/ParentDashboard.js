import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import UserProfileMenu from '../../components/UserProfileMenu';
import './Dashboard.css';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import 'primeicons/primeicons.css';

const ParentDashboard = () => {
  const { getCurrentUser, logout, get } = useApi();
  const { parentMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [parentStats, setParentStats] = useState({
    hijos: 0,
    mensajes: 0,
    pagosPendientes: 0,
    eventos: 0,
    historialPagos: [],
    estadoPagos: []
  });
  const user = getCurrentUser();

  useEffect(() => {
    cargarDatosPadre();
  }, []);

  const cargarDatosPadre = async () => {
    try {
      const response = await get('/dashboard/padre');
      if (response.success) {
        setParentStats(response.data);
      }
    } catch (error) {
      console.error('Error al cargar datos del padre:', error);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(valor).replace('BOB', 'Bs');
  };

  return (
    <div className="dashboard">
      <div className={`dashboard-sidebar ${!isMenuOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Guardería</span>
          </div>
          <div className="sidebar-subtitle">Portal de Padres</div>
        </div>
        
        <nav className="sidebar-menu">
          {parentMenus.map(menu => (
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
            <h1>Portal de Padres</h1>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="dashboard-card primary">
              <div className="card-icon">
                <i className="pi pi-users"></i>
              </div>
              <div className="card-content">
                <h3>Mis Hijos</h3>
                <div className="card-value">{parentStats.hijos}</div>
                <div className="card-description">Niños registrados</div>
              </div>
            </div>
            
            <div className="dashboard-card info">
              <div className="card-icon">
                <i className="pi pi-envelope"></i>
              </div>
              <div className="card-content">
                <h3>Mensajes</h3>
                <div className="card-value">{parentStats.mensajes}</div>
                <div className="card-description">Nuevos mensajes</div>
              </div>
            </div>
            
            <div className="dashboard-card warning">
              <div className="card-icon">
                <i className="pi pi-credit-card"></i>
              </div>
              <div className="card-content">
                <h3>Pagos Pendientes</h3>
                <div className="card-value">{formatearMoneda(parentStats.pagosPendientes)}</div>
                <div className="card-description">Montos por pagar</div>
              </div>
            </div>
            
            <div className="dashboard-card success">
              <div className="card-icon">
                <i className="pi pi-calendar"></i>
              </div>
              <div className="card-content">
                <h3>Próximos Eventos</h3>
                <div className="card-value">{parentStats.eventos}</div>
                <div className="card-description">Eventos programados</div>
              </div>
            </div>
          </div>

          {parentStats.historialPagos && parentStats.historialPagos.length > 0 && (
            <div className="parent-charts">
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Historial de Pagos</h3>
                  <div className="chart-subtitle">Últimos 6 meses</div>
                </div>
                <div className="chart-content">
                  <ResponsiveLine
                    data={[{
                      id: 'pagos',
                      data: parentStats.historialPagos
                    }]}
                    margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    curve="cardinal"
                    colors={['#4ecdc4']}
                    pointSize={8}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    axisBottom={{
                      tickRotation: -45
                    }}
                    axisLeft={{
                      format: value => formatearMoneda(value)
                    }}
                    animate={true}
                    motionConfig="wobbly"
                  />
                </div>
              </div>

              {parentStats.estadoPagos && parentStats.estadoPagos.length > 0 && (
                <div className="chart-container">
                  <div className="chart-header">
                    <h3>Estado de Pagos</h3>
                    <div className="chart-subtitle">Distribución actual</div>
                  </div>
                  <div className="chart-content">
                    <ResponsivePie
                      data={parentStats.estadoPagos}
                      margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                      innerRadius={0.4}
                      colors={['#27ae60', '#f39c12', '#e74c3c']}
                      borderWidth={2}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                      animate={true}
                      motionConfig="gentle"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;