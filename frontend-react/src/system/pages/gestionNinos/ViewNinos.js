import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionNinos.css';

const ViewNinos = ({ nino, onVolver }) => {
  const { get } = useApi();
  const [ninoData, setNinoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historialAsistencia, setHistorialAsistencia] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);

  useEffect(() => {
    if (nino) {
      cargarDatosNino();
    }
  }, [nino]);

  const cargarDatosNino = async () => {
    setLoading(true);
    try {
      const response = await get(`/ninos/${nino.nin_id}`);
      if (response.success && response.data) {
        setNinoData(response.data);
        
        const asistenciaResponse = await get(`/asistencia/nino/${nino.nin_id}`);
        if (asistenciaResponse.success && asistenciaResponse.data) {
          setHistorialAsistencia(asistenciaResponse.data);
        }
        
        const pagosResponse = await get(`/pagos/nino/${nino.nin_id}`);
        if (pagosResponse.success && pagosResponse.data) {
          setHistorialPagos(pagosResponse.data);
        }
      } else {
        setNinoData(nino);
      }
    } catch (error) {
      console.error('Error al cargar datos del niño:', error);
      setNinoData(nino);
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
    return <div className="loading">Cargando información...</div>;
  }

  if (!ninoData) {
    return <div className="error-message">No se pudo cargar la información del niño.</div>;
  }

  return (
    <div className="view-nino">
      <div className="view-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles del Niño</h2>
      </div>

      <div className="nino-view-content">
        <div className="nino-view-section perfil">
          <div className="nino-foto-grande">
            {ninoData.nin_foto ? (
              <img 
                src={ninoData.nin_foto.startsWith('http') 
                  ? ninoData.nin_foto 
                  : `${process.env.REACT_APP_API_URL}storage/${ninoData.nin_foto}`} 
                alt={ninoData.nin_nombre} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                }}
              />
            ) : (
              <div className="foto-placeholder-grande">
                <i className="pi pi-user"></i>
              </div>
            )}
          </div>
          <div className="nino-info-principal">
            <h3>{ninoData.nin_nombre} {ninoData.nin_apellido}</h3>
            <div className="status-badge">
              <span className={`estado-badge ${ninoData.nin_estado || 'activo'}`}>
                {ninoData.nin_estado || 'activo'}
              </span>
            </div>
            <div className="info-group">
              <p><i className="pi pi-calendar"></i> <strong>Fecha de Nacimiento:</strong> {formatFecha(ninoData.nin_fecha_nacimiento)}</p>
              <p><i className="pi pi-user"></i> <strong>Edad:</strong> {ninoData.nin_edad} años</p>
              <p><i className="pi pi-venus-mars"></i> <strong>Género:</strong> {ninoData.nin_genero === 'masculino' ? 'Masculino' : 'Femenino'}</p>
              {ninoData.grupo_actual && (
                <p><i className="pi pi-users"></i> <strong>Grupo:</strong> {ninoData.grupo_actual.grp_nombre}</p>
              )}
            </div>
          </div>
        </div>

        <div className="nino-view-tabs">
          <div className="nino-view-section">
            <h4><i className="pi pi-user"></i> Información Personal</h4>
            <div className="info-detail">
              <p><strong>Tutor Legal:</strong> {
                ninoData.relacionesPadres && ninoData.relacionesPadres.length > 0 
                  ? `${ninoData.relacionesPadres[0].padre.usuario.usr_nombre} ${ninoData.relacionesPadres[0].padre.usuario.usr_apellido}`
                  : 'No asignado'
              }</p>
              <p><strong>Estado:</strong> {ninoData.nin_estado || 'Activo'}</p>
            </div>
          </div>

          <div className="nino-view-section">
            <h4><i className="pi pi-heart"></i> Información Médica</h4>
            <div className="info-detail">
              <p><strong>Alergias:</strong> {ninoData.nin_alergias || 'Ninguna registrada'}</p>
              <p><strong>Medicamentos:</strong> {ninoData.nin_medicamentos || 'Ninguno registrado'}</p>
            </div>
          </div>

          <div className="nino-view-section">
            <h4><i className="pi pi-comment"></i> Observaciones</h4>
            <div className="info-detail">
              <p>{ninoData.nin_observaciones || 'No hay observaciones registradas'}</p>
            </div>
          </div>

          {ninoData.grupo_actual && (
            <div className="nino-view-section">
              <h4><i className="pi pi-users"></i> Grupo Asignado</h4>
              <div className="info-detail grupo-info">
                <p><strong>Nombre del Grupo:</strong> {ninoData.grupo_actual.grp_nombre}</p>
                <p><strong>Edades:</strong> {ninoData.grupo_actual.grp_edad_minima} - {ninoData.grupo_actual.grp_edad_maxima} años</p>
                <p><strong>Descripción:</strong> {ninoData.grupo_actual.grp_descripcion || 'Sin descripción'}</p>
              </div>
            </div>
          )}
          
          <div className="nino-view-section">
            <h4><i className="pi pi-calendar"></i> Historial de Asistencia</h4>
            <div className="historial-table">
              {historialAsistencia.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialAsistencia.map((asistencia, index) => (
                      <tr key={index}>
                        <td>{formatFecha(asistencia.ast_fecha)}</td>
                        <td>{asistencia.ast_hora_entrada || 'No registrado'}</td>
                        <td>{asistencia.ast_hora_salida || 'No registrado'}</td>
                        <td>
                          <span className={`estado ${asistencia.ast_estado}`}>
                            {asistencia.ast_estado || 'pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No hay registros de asistencia disponibles</p>
              )}
            </div>
          </div>
          
          <div className="nino-view-section">
            <h4><i className="pi pi-money-bill"></i> Historial de Pagos</h4>
            <div className="historial-table">
              {historialPagos.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPagos.map((pago, index) => (
                      <tr key={index}>
                        <td>{formatFecha(pago.pag_fecha)}</td>
                        <td>{pago.pag_concepto}</td>
                        <td>Bs. {pago.pag_monto}</td>
                        <td>
                          <span className={`estado ${pago.pag_estado}`}>
                            {pago.pag_estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No hay registros de pagos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="view-actions">
        <button onClick={onVolver} className="btn-secondary">
          <i className="pi pi-arrow-left"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default ViewNinos;
