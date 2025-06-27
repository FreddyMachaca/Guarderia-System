import React from 'react';
import './GestionReportes.css';

const ListaReportes = ({ onGenerarReporte }) => {
  const tiposReportes = [
    {
      id: 'ingresos',
      titulo: 'Reporte de Ingresos',
      descripcion: 'Reporte detallado de todos los ingresos por pagos de mensualidades',
      icono: 'pi pi-money-bill',
      color: 'success'
    },
    {
      id: 'ninos-inscritos',
      titulo: 'Niños Inscritos',
      descripcion: 'Listado de todos los niños registrados en el sistema',
      icono: 'pi pi-users',
      color: 'info'
    },
    {
      id: 'grupos',
      titulo: 'Reporte de Grupos',
      descripcion: 'Estadísticas y detalles de todos los grupos y su capacidad',
      icono: 'pi pi-building',
      color: 'warning'
    },
    {
      id: 'pagos',
      titulo: 'Reporte de Pagos',
      descripcion: 'Estado de pagos y mensualidades de todos los niños',
      icono: 'pi pi-credit-card',
      color: 'primary'
    },
    {
      id: 'asignaciones',
      titulo: 'Reporte de Asignaciones',
      descripcion: 'Historial de asignaciones de niños a grupos',
      icono: 'pi pi-sitemap',
      color: 'secondary'
    }
  ];

  return (
    <div className="rpt-lista-reportes">
      <div className="rpt-lista-header">
        <div className="rpt-header-title">
          <h2>Generación de Reportes</h2>
          <p>Selecciona el tipo de reporte que deseas generar</p>
        </div>
      </div>

      <div className="rpt-reportes-grid">
        {tiposReportes.map((reporte) => (
          <div 
            key={reporte.id} 
            className={`rpt-reporte-card rpt-card-${reporte.color}`}
            onClick={() => onGenerarReporte(reporte)}
          >
            <div className="rpt-card-icon">
              <i className={reporte.icono}></i>
            </div>
            <div className="rpt-card-content">
              <h3>{reporte.titulo}</h3>
              <p>{reporte.descripcion}</p>
            </div>
            <div className="rpt-card-action">
              <button className="rpt-btn-generar">
                <i className="pi pi-file-pdf"></i>
                Generar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rpt-info-section">
        <div className="rpt-info-card">
          <div className="rpt-info-icon">
            <i className="pi pi-info-circle"></i>
          </div>
          <div className="rpt-info-content">
            <h4>Información sobre los Reportes</h4>
            <ul>
              <li>Los reportes se generan en formato PDF para visualización e impresión</li>
              <li>También puedes descargar los datos en formato Excel para análisis</li>
              <li>Puedes seleccionar rangos de fechas específicos para filtrar la información</li>
              <li>Todos los reportes incluyen datos actualizados en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaReportes;
