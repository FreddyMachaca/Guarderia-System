import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { useApi } from '../../hooks/useApi';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './DashboardAnalytics.css';

const DashboardAnalytics = () => {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('anual');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState({
    ingresos: [],
    ninos: [],
    estadisticas: {},
    pagosPorMetodo: [],
    ninosPorGrupo: [],
    distribucionEdades: []
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, [dateFilter, selectedYear]);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    try {
      const fechas = obtenerFechas();
      
      const [
        ingresosRes,
        ninosRes,
        estadisticasRes,
        pagosRes,
        gruposRes
      ] = await Promise.all([
        get(`/dashboard/ingresos?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}&periodo=${dateFilter}`),
        get(`/dashboard/ninos?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`),
        get('/dashboard/estadisticas'),
        get(`/dashboard/pagos-metodo?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`),
        get('/dashboard/ninos-por-grupo')
      ]);

      setDashboardData({
        ingresos: ingresosRes.data || [],
        ninos: ninosRes.data || [],
        estadisticas: estadisticasRes.data || {},
        pagosPorMetodo: pagosRes.data || [],
        ninosPorGrupo: gruposRes.data || [],
        distribucionEdades: procesarDistribucionEdades(ninosRes.data || [])
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerFechas = () => {
    const ahora = new Date();
    let inicio, fin;

    switch (dateFilter) {
      case 'semanal':
        inicio = startOfWeek(ahora, { locale: es });
        fin = endOfWeek(ahora, { locale: es });
        break;
      case 'mensual':
        inicio = startOfMonth(ahora);
        fin = endOfMonth(ahora);
        break;
      case 'anual':
      default:
        inicio = startOfYear(new Date(selectedYear, 0, 1));
        fin = endOfYear(new Date(selectedYear, 0, 1));
        break;
    }

    return {
      inicio: format(inicio, 'yyyy-MM-dd'),
      fin: format(fin, 'yyyy-MM-dd')
    };
  };

  const procesarDistribucionEdades = (ninos) => {
    const edades = {};
    ninos.forEach(nino => {
      const edad = nino.nin_edad;
      edades[edad] = (edades[edad] || 0) + 1;
    });

    return Object.entries(edades).map(([edad, cantidad]) => ({
      id: `${edad} años`,
      label: `${edad} años`,
      value: cantidad
    }));
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(valor).replace('BOB', 'Bs');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-analytics">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard Analítico</h1>
          <p>Análisis completo del sistema de guardería</p>
        </div>
        
        <div className="dashboard-filters">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="semanal">Esta Semana</option>
            <option value="mensual">Este Mes</option>
            <option value="anual">Este Año</option>
          </select>
          
          {dateFilter === 'anual' && (
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="filter-select"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="pi pi-money-bill"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatearMoneda(dashboardData.estadisticas.ingresos_totales || 0)}</div>
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-change positive">+{dashboardData.estadisticas.crecimiento_ingresos || 0}%</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="pi pi-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.estadisticas.total_ninos || 0}</div>
            <div className="stat-label">Niños Inscritos</div>
            <div className="stat-change positive">+{dashboardData.estadisticas.nuevos_ninos || 0} este mes</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="pi pi-building"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.estadisticas.total_grupos || 0}</div>
            <div className="stat-label">Grupos Activos</div>
            <div className="stat-change neutral">{dashboardData.estadisticas.ocupacion_promedio || 0}% ocupación</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="pi pi-credit-card"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatearMoneda(dashboardData.estadisticas.pagos_pendientes || 0)}</div>
            <div className="stat-label">Pagos Pendientes</div>
            <div className="stat-change negative">{dashboardData.estadisticas.mensualidades_vencidas || 0} vencidas</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="chart-container large">
          <div className="chart-header">
            <h3>Ingresos {dateFilter === 'anual' ? 'Mensuales' : dateFilter === 'mensual' ? 'Diarios' : 'por Día'}</h3>
            <div className="chart-subtitle">Evolución de ingresos en el período seleccionado</div>
          </div>
          <div className="chart-content">
            <ResponsiveLine
              data={[{
                id: 'ingresos',
                data: dashboardData.ingresos
              }]}
              margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
              curve="cardinal"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45
              }}
              axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: value => formatearMoneda(value)
              }}
              pointSize={8}
              pointColor={{ from: 'color', modifiers: [] }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableSlices="x"
              useMesh={true}
              colors={['#4ecdc4']}
              animate={true}
              motionConfig="wobbly"
              theme={{
                grid: {
                  line: {
                    stroke: '#e0e0e0',
                    strokeWidth: 1
                  }
                },
                axis: {
                  ticks: {
                    text: {
                      fontSize: 12,
                      fill: '#666'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Distribución por Método de Pago</h3>
            <div className="chart-subtitle">Preferencias de pago de los padres</div>
          </div>
          <div className="chart-content">
            <ResponsivePie
              data={dashboardData.pagosPorMetodo}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.4}
              padAngle={2}
              cornerRadius={8}
              activeOuterRadiusOffset={8}
              colors={['#4ecdc4', '#ff6b35', '#4a6bff', '#f7931e', '#9b59b6']}
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
              theme={{
                labels: {
                  text: {
                    fontSize: 12,
                    fontWeight: 600
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Niños por Grupo</h3>
            <div className="chart-subtitle">Distribución actual de niños</div>
          </div>
          <div className="chart-content">
            <ResponsiveBar
              data={dashboardData.ninosPorGrupo}
              keys={['cantidad']}
              indexBy="grupo"
              margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#4ecdc4']}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              animate={true}
              motionConfig="wobbly"
              theme={{
                grid: {
                  line: {
                    stroke: '#e0e0e0',
                    strokeWidth: 1
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Distribución por Edades</h3>
            <div className="chart-subtitle">Rango de edades de los niños</div>
          </div>
          <div className="chart-content">
            <ResponsiveCirclePacking
              data={{
                name: 'edades',
                children: dashboardData.distribucionEdades
              }}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              id="id"
              value="value"
              colors={['#4ecdc4', '#ff6b35', '#4a6bff', '#f7931e', '#9b59b6', '#e74c3c']}
              childColor={{ from: 'color', modifiers: [['brighter', 0.4]] }}
              padding={4}
              enableLabels={true}
              labelsSkipRadius={10}
              labelTextColor="#ffffff"
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-insights">
        <div className="insight-card">
          <div className="insight-icon">
            <i className="pi pi-chart-line"></i>
          </div>
          <div className="insight-content">
            <h4>Tendencia de Crecimiento</h4>
            <p>Los ingresos han crecido un {dashboardData.estadisticas.crecimiento_ingresos || 0}% comparado con el período anterior.</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">
            <i className="pi pi-exclamation-triangle"></i>
          </div>
          <div className="insight-content">
            <h4>Atención Requerida</h4>
            <p>{dashboardData.estadisticas.mensualidades_vencidas || 0} mensualidades están vencidas por un total de {formatearMoneda(dashboardData.estadisticas.pagos_pendientes || 0)}.</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">
            <i className="pi pi-users"></i>
          </div>
          <div className="insight-content">
            <h4>Capacidad de Grupos</h4>
            <p>La ocupación promedio es del {dashboardData.estadisticas.ocupacion_promedio || 0}%, {dashboardData.estadisticas.grupos_llenos || 0} grupos están al máximo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;