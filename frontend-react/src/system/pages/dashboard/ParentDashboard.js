import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import UserProfileMenu from '../../components/UserProfileMenu';
import './Dashboard.css';
import './ParentDashboard.css';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import 'primeicons/primeicons.css';

const ParentDashboard = () => {
  const { getCurrentUser, logout, get } = useApi();
  const { parentMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [parentData, setParentData] = useState({
    resumen: {
      totalHijos: 0,
      hijosActivos: 0,
      pagosPendientes: 0
    },
    hijos: [],
    pagosRecientes: [],
    estadoPagos: [],
    proximosVencimientos: []
  });
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    cargarDatosPadre();
  }, []);

  const cargarDatosPadre = async () => {
    try {
      setLoading(true);
      const response = await get('/dashboard/padre-completo');
      if (response.success) {
        setParentData(response.data);
      }
    } catch (error) {
      console.error('Error al cargar datos del padre:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(valor).replace('BOB', 'Bs');
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEdadText = (edad) => {
    return edad === 1 ? `${edad} año` : `${edad} años`;
  };

  const getEstadoPagoColor = (estado) => {
    switch (estado) {
      case 'pagado': return '#27ae60';
      case 'pendiente': return '#f39c12';
      case 'vencido': return '#e74c3c';
      case 'parcial': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

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
            <div className="header-info">
              <h1>Bienvenido, {user?.usr_nombre}</h1>
              <p>Portal de información de sus hijos</p>
            </div>
          </div>
          <div className="header-right">
            <UserProfileMenu user={user} onLogout={logout} />
          </div>
        </header>
        
        <div className="dashboard-content parent-dashboard">
          <div className="dashboard-cards">
            <div className="dashboard-card primary">
              <div className="card-icon">
                <i className="pi pi-users"></i>
              </div>
              <div className="card-content">
                <h3>Mis Hijos</h3>
                <div className="card-value">{parentData.resumen.totalHijos}</div>
                <div className="card-description">
                  {parentData.resumen.hijosActivos} activos
                </div>
              </div>
            </div>
            
            <div className="dashboard-card warning">
              <div className="card-icon">
                <i className="pi pi-money-bill"></i>
              </div>
              <div className="card-content">
                <h3>Pagos Pendientes</h3>
                <div className="card-value">{formatearMoneda(parentData.resumen.pagosPendientes)}</div>
                <div className="card-description">Por cancelar</div>
              </div>
            </div>
          </div>

          <div className="parent-content-grid">
            <div className="content-section hijos-section">
              <div className="section-header">
                <h3><i className="pi pi-users"></i> Información de Mis Hijos</h3>
              </div>
              <div className="hijos-cards">
                {parentData.hijos.map((hijo) => (
                  <div key={hijo.nin_id} className="hijo-card">
                    <div className="hijo-foto">
                      {hijo.nin_foto ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}storage/${hijo.nin_foto}`} 
                          alt={hijo.nin_nombre}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="foto-placeholder" style={{display: hijo.nin_foto ? 'none' : 'flex'}}>
                        <i className="pi pi-user"></i>
                      </div>
                    </div>
                    <div className="hijo-info">
                      <h4>{hijo.nin_nombre} {hijo.nin_apellido}</h4>
                      <div className="hijo-detalles">
                        <div className="detalle-item">
                          <i className="pi pi-calendar"></i>
                          <span>{getEdadText(hijo.nin_edad)}</span>
                        </div>
                        <div className="detalle-item">
                          <i className="pi pi-building"></i>
                          <span>{hijo.grupo?.grp_nombre || 'Sin asignar'}</span>
                        </div>
                        <div className="detalle-item">
                          <i className="pi pi-user"></i>
                          <span>{hijo.maestro?.nombre_completo || 'Sin maestro'}</span>
                        </div>
                        <div className="detalle-item estado">
                          <i className={`pi ${hijo.nin_estado === 'activo' ? 'pi-check-circle' : 'pi-times-circle'}`}></i>
                          <span className={`estado-${hijo.nin_estado}`}>
                            {hijo.nin_estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      {hijo.ultima_mensualidad && (
                        <div className="ultimo-pago">
                          <div className="pago-info-simple">
                            <span className="aula-pago">
                              AULA {hijo.grupo?.grp_nombre || 'SIN ASIGNAR'}
                            </span>
                            <span className={`estado-pago ${hijo.ultima_mensualidad.estado}`}>
                              Estado de Pago: {hijo.ultima_mensualidad.estado.charAt(0).toUpperCase() + hijo.ultima_mensualidad.estado.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-section pagos-section">
              <div className="section-header">
                <h3><i className="pi pi-money-bill"></i> Estado de Pagos</h3>
              </div>
              <div className="pagos-content">
                {parentData.estadoPagos && parentData.estadoPagos.length > 0 ? (
                  <div className="chart-container">
                    <ResponsivePie
                      data={parentData.estadoPagos}
                      margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                      innerRadius={0.5}
                      colors={({ data }) => getEstadoPagoColor(data.id.toLowerCase())}
                      borderWidth={2}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                      arcLinkLabelsSkipAngle={10}
                      arcLinkLabelsTextColor="#333333"
                      arcLinkLabelsThickness={2}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor="#ffffff"
                      animate={true}
                      motionConfig="gentle"
                      legends={[
                        {
                          anchor: 'bottom',
                          direction: 'row',
                          justify: false,
                          translateX: 0,
                          translateY: 56,
                          itemsSpacing: 0,
                          itemWidth: 100,
                          itemHeight: 18,
                          itemTextColor: '#999',
                          itemDirection: 'left-to-right',
                          itemOpacity: 1,
                          symbolSize: 18,
                          symbolShape: 'circle'
                        }
                      ]}
                    />
                  </div>
                ) : (
                  <div className="no-data">
                    <i className="pi pi-info-circle"></i>
                    <p>No hay datos de pagos disponibles</p>
                  </div>
                )}
              </div>
            </div>

            <div className="content-section historial-section">
              <div className="section-header">
                <h3><i className="pi pi-history"></i> Historial de Pagos</h3>
              </div>
              <div className="historial-content">
                {parentData.pagosRecientes && parentData.pagosRecientes.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveLine
                      data={[{
                        id: 'pagos',
                        data: parentData.pagosRecientes
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
                      useMesh={true}
                      enableSlices="x"
                    />
                  </div>
                ) : (
                  <div className="no-data">
                    <i className="pi pi-info-circle"></i>
                    <p>No hay historial de pagos disponible</p>
                  </div>
                )}
              </div>
            </div>

            <div className="content-section vencimientos-section">
              <div className="section-header">
                <h3><i className="pi pi-exclamation-triangle"></i> Próximos Vencimientos</h3>
              </div>
              <div className="vencimientos-list">
                {parentData.proximosVencimientos.length > 0 ? (
                  parentData.proximosVencimientos.map((vencimiento, index) => (
                    <div key={index} className="vencimiento-item">
                      <div className="vencimiento-hijo">
                        <i className="pi pi-user"></i>
                        <span>{vencimiento.hijo_nombre}</span>
                      </div>
                      <div className="vencimiento-fecha">
                        <i className="pi pi-calendar"></i>
                        <span>{formatFecha(vencimiento.fecha_vencimiento)}</span>
                      </div>
                      <div className="vencimiento-monto">
                        {formatearMoneda(vencimiento.monto)}
                      </div>
                      <div className={`vencimiento-estado ${vencimiento.dias_restantes <= 0 ? 'vencido' : vencimiento.dias_restantes <= 5 ? 'proximo' : 'normal'}`}>
                        {vencimiento.dias_restantes <= 0 
                          ? 'Vencido' 
                          : `${vencimiento.dias_restantes} días`
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <i className="pi pi-check-circle"></i>
                    <p>No hay vencimientos próximos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;