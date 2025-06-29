import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './MisHijos.css';

const ViewMiHijo = ({ hijo, onVolver }) => {
  const { get } = useApi();
  const [hijoData, setHijoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hijo) {
      cargarDatosHijo();
    }
  }, [hijo]);

  const cargarDatosHijo = async () => {
    setLoading(true);
    try {
      const response = await get(`/mis-hijos/${hijo.nin_id}`);
      if (response.success && response.data) {
        setHijoData(response.data);
      } else {
        setHijoData(hijo);
      }
    } catch (error) {
      console.error('Error al cargar datos del hijo:', error);
      setHijoData(hijo);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div className="mis-hijos-loading">Cargando información...</div>;
  }

  if (!hijoData) {
    return <div className="mis-hijos-error-message">No se pudo cargar la información de mi hijo.</div>;
  }

  return (
    <div className="mis-hijos-view">
      <div className="mis-hijos-view-header">
        <button className="mis-hijos-btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles de Mi Hijo</h2>
      </div>

      <div className="mis-hijos-view-content">
        <div className="mis-hijos-view-section mis-hijos-perfil">
          <div className="mis-hijos-foto-grande">
            {hijoData.nin_foto ? (
              <img 
                src={hijoData.nin_foto.startsWith('http') 
                  ? hijoData.nin_foto 
                  : `${process.env.REACT_APP_API_URL}storage/${hijoData.nin_foto}`} 
                alt={hijoData.nin_nombre} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                }}
              />
            ) : (
              <div className="mis-hijos-foto-placeholder-grande">
                <i className="pi pi-user"></i>
              </div>
            )}
          </div>
          <div className="mis-hijos-info-principal">
            <h3>{hijoData.nin_nombre} {hijoData.nin_apellido}</h3>
            <div className="mis-hijos-status-badge">
              <span className={`mis-hijos-estado-badge ${hijoData.nin_estado || 'activo'}`}>
                {hijoData.nin_estado || 'activo'}
              </span>
            </div>
            <div className="mis-hijos-info-group">
              <p><i className="pi pi-calendar"></i> <strong>Fecha de Nacimiento:</strong> {formatFecha(hijoData.nin_fecha_nacimiento)}</p>
              <p><i className="pi pi-user"></i> <strong>Edad:</strong> {hijoData.nin_edad} años</p>
              <p><i className="pi pi-venus-mars"></i> <strong>Género:</strong> {hijoData.nin_genero === 'masculino' ? 'Masculino' : 'Femenino'}</p>
              {hijoData.grupo_actual && (
                <p><i className="pi pi-users"></i> <strong>Grupo:</strong> {hijoData.grupo_actual.grp_nombre}</p>
              )}
              {hijoData.maestro && (
                <p><i className="pi pi-user-plus"></i> <strong>Maestro:</strong> {hijoData.maestro.nombre_completo}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mis-hijos-view-tabs">
          <div className="mis-hijos-view-section">
            <h4><i className="pi pi-user"></i> Información Personal</h4>
            <div className="mis-hijos-info-detail">
              <p><strong>Estado:</strong> {hijoData.nin_estado || 'Activo'}</p>
              <p><strong>Fecha de Inscripción:</strong> {formatFecha(hijoData.nin_fecha_inscripcion)}</p>
            </div>
          </div>

          <div className="mis-hijos-view-section">
            <h4><i className="pi pi-heart"></i> Información Médica</h4>
            <div className="mis-hijos-info-detail">
              <p><strong>Alergias:</strong> {hijoData.nin_alergias || 'Ninguna registrada'}</p>
              <p><strong>Medicamentos:</strong> {hijoData.nin_medicamentos || 'Ninguno registrado'}</p>
            </div>
          </div>

          <div className="mis-hijos-view-section">
            <h4><i className="pi pi-comment"></i> Observaciones</h4>
            <div className="mis-hijos-info-detail">
              <p>{hijoData.nin_observaciones || 'No hay observaciones registradas'}</p>
            </div>
          </div>

          {hijoData.grupo_actual && (
            <div className="mis-hijos-view-section">
              <h4><i className="pi pi-users"></i> Grupo Asignado</h4>
              <div className="mis-hijos-info-detail mis-hijos-grupo-info">
                <p><strong>Nombre del Grupo:</strong> {hijoData.grupo_actual.grp_nombre}</p>
                <p><strong>Fecha de Asignación:</strong> {formatFecha(hijoData.grupo_actual.fecha_asignacion)}</p>
                {hijoData.maestro && (
                  <p><strong>Maestro Responsable:</strong> {hijoData.maestro.nombre_completo}</p>
                )}
              </div>
            </div>
          )}

          {hijoData.historial_grupos && hijoData.historial_grupos.length > 0 && (
            <div className="mis-hijos-view-section">
              <h4><i className="pi pi-history"></i> Historial de Grupos</h4>
              <div className="mis-hijos-historial-table">
                <table>
                  <thead>
                    <tr>
                      <th>Grupo</th>
                      <th>Fecha Asignación</th>
                      <th>Fecha Baja</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hijoData.historial_grupos.map((historial, index) => (
                      <tr key={index}>
                        <td>{historial.grp_nombre}</td>
                        <td>{formatFecha(historial.fecha_asignacion)}</td>
                        <td>{historial.fecha_baja ? formatFecha(historial.fecha_baja) : 'Sin fecha de baja'}</td>
                        <td>
                          <span className={`mis-hijos-estado ${historial.estado}`}>
                            {historial.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mis-hijos-view-actions">
        <button onClick={onVolver} className="mis-hijos-btn-secondary">
          <i className="pi pi-arrow-left"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default ViewMiHijo;
