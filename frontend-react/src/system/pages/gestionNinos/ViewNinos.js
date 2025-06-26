import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionNinos.css';

const ViewNinos = ({ nino, onVolver }) => {
  const { get } = useApi();
  const [ninoData, setNinoData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getTutorLegalInfo = () => {
    if (ninoData.relacionesPadres && ninoData.relacionesPadres.length > 0) {
      const relacion = ninoData.relacionesPadres[0];
      const padre = relacion.padre;
      const usuario = padre.usuario;
      
      return {
        nombre_completo: `${usuario.usr_nombre} ${usuario.usr_apellido}`,
        direccion: padre.pdr_direccion || 'No registrada',
        ci: padre.pdr_ci && padre.pdr_ci_ext ? `${padre.pdr_ci} ${padre.pdr_ci_ext}` : 'No registrado',
        telefono: usuario.usr_telefono || 'No registrado',
        email: usuario.usr_email || 'No registrado',
        contacto_emergencia: padre.pdr_contacto_emergencia || 'No registrado',
        ocupacion: padre.pdr_ocupacion || 'No registrada',
        parentesco: relacion.rel_parentesco || 'No especificado'
      };
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  if (!ninoData) {
    return <div className="error-message">No se pudo cargar la información del niño.</div>;
  }

  const tutorInfo = getTutorLegalInfo();

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
              <p><strong>Estado:</strong> {ninoData.nin_estado || 'Activo'}</p>
              <p><strong>Fecha de Inscripción:</strong> {formatFecha(ninoData.nin_fecha_inscripcion)}</p>
            </div>
          </div>

          {tutorInfo && (
            <div className="nino-view-section">
              <h4><i className="pi pi-user-plus"></i> Información del Tutor Legal</h4>
              <div className="info-detail tutor-info">
                <div className="tutor-card">
                  <h5>{tutorInfo.nombre_completo}</h5>
                  <p><i className="pi pi-heart"></i> <strong>Parentesco:</strong> {tutorInfo.parentesco}</p>
                  <p><i className="pi pi-id-card"></i> <strong>Cédula de Identidad:</strong> {tutorInfo.ci}</p>
                  <p><i className="pi pi-phone"></i> <strong>Teléfono:</strong> {tutorInfo.telefono}</p>
                  <p><i className="pi pi-envelope"></i> <strong>Email:</strong> {tutorInfo.email}</p>
                  <p><i className="pi pi-map-marker"></i> <strong>Dirección:</strong> {tutorInfo.direccion}</p>
                  <p><i className="pi pi-briefcase"></i> <strong>Ocupación:</strong> {tutorInfo.ocupacion}</p>
                  <p><i className="pi pi-exclamation-triangle"></i> <strong>Contacto de Emergencia:</strong> {tutorInfo.contacto_emergencia}</p>
                </div>
              </div>
            </div>
          )}

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
                <p><strong>Fecha de Asignación:</strong> {formatFecha(ninoData.grupo_actual.fecha_asignacion)}</p>
              </div>
            </div>
          )}

          {ninoData.historial_grupos && ninoData.historial_grupos.length > 0 && (
            <div className="nino-view-section">
              <h4><i className="pi pi-history"></i> Historial de Grupos</h4>
              <div className="historial-table">
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
                    {ninoData.historial_grupos.map((historial, index) => (
                      <tr key={index}>
                        <td>{historial.grp_nombre}</td>
                        <td>{formatFecha(historial.fecha_asignacion)}</td>
                        <td>{historial.fecha_baja ? formatFecha(historial.fecha_baja) : 'Actual'}</td>
                        <td>
                          <span className={`estado ${historial.estado}`}>
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

      <div className="view-actions">
        <button onClick={onVolver} className="btn-secondary">
          <i className="pi pi-arrow-left"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default ViewNinos;