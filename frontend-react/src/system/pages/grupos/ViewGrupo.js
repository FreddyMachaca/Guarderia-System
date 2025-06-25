import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionGrupos.css';

const ViewGrupo = ({ grupo, onVolver }) => {
  const { get } = useApi();
  const [grupoData, setGrupoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ninosAsignados, setNinosAsignados] = useState([]);

  useEffect(() => {
    if (grupo) {
      cargarDatosGrupo();
    }
  }, [grupo]);

  const cargarDatosGrupo = async () => {
    setLoading(true);
    try {
      const response = await get(`/grupos/${grupo.grp_id}`);
      if (response.success && response.data) {
        setGrupoData(response.data);
        
        const ninosResponse = await get(`/grupos/${grupo.grp_id}/ninos`);
        if (ninosResponse.success && ninosResponse.data) {
          const ninos = Array.isArray(ninosResponse.data) ? ninosResponse.data : [];
          const ninosFormateados = ninos.filter(nino => nino.estado === 'activo').map(nino => ({
            nin_id: nino.ninoId,
            nin_nombre: nino.nombre,
            nin_apellido: nino.apellido,
            nin_edad: nino.edad,
            nin_genero: nino.genero || 'masculino',
            nin_estado: 'activo',
            nin_foto: nino.foto || null
          }));
          setNinosAsignados(ninosFormateados);
        } else {
          setNinosAsignados([]);
        }
      } else {
        setGrupoData(grupo);
        setNinosAsignados([]);
      }
    } catch (error) {
      console.error('Error al cargar datos del grupo:', error);
      setGrupoData(grupo);
      setNinosAsignados([]);
    } finally {
      setLoading(false);
    }
  };

  const calculaOcupacion = () => {
    if (!grupoData || !grupoData.grp_capacidad) return 0;
    return (ninosAsignados.length / grupoData.grp_capacidad) * 100;
  };

  const ocupacion = calculaOcupacion();
  const ocupacionClass = 
    ocupacion >= 90 ? 'alta' :
    ocupacion >= 60 ? 'media' : 'baja';

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  if (!grupoData) {
    return <div className="error-message">No se pudo cargar la información del grupo.</div>;
  }

  return (
    <div className="view-grupo">
      <div className="view-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles del Grupo</h2>
      </div>

      <div className="grupo-view-content">
        <div className="grupo-view-section principal">
          <div className="grupo-icon-large">
            <i className="pi pi-building"></i>
          </div>
          <div className="grupo-info-principal">
            <h3>{grupoData.grp_nombre}</h3>
            <div className="status-badge">
              <span className={`estado-badge ${grupoData.grp_estado || 'activo'}`}>
                {grupoData.grp_estado || 'activo'}
              </span>
            </div>
            <div className="info-group">
              <p><i className="pi pi-users"></i> <strong>Rango de edad:</strong> {grupoData.grp_edad_minima} - {grupoData.grp_edad_maxima} años</p>
              <p><i className="pi pi-th-large"></i> <strong>Capacidad:</strong> {grupoData.grp_capacidad} niños</p>
              <p><i className="pi pi-user"></i> <strong>Educador:</strong> {grupoData.grp_educador || 'No asignado'}</p>
            </div>
          </div>
          <div className="ocupacion-container">
            <div className="ocupacion-titulo">Ocupación</div>
            <div className={`ocupacion-chart ${ocupacionClass}`}>
              <div className="ocupacion-barra" style={{ width: `${Math.min(ocupacion, 100)}%` }}></div>
              <div className="ocupacion-texto">{Math.round(ocupacion)}%</div>
            </div>
            <div className="ocupacion-detalle">
              {ninosAsignados.length} de {grupoData.grp_capacidad} niños
            </div>
          </div>
        </div>

        <div className="grupo-view-tabs">
          <div className="grupo-view-section">
            <h4><i className="pi pi-info-circle"></i> Información General</h4>
            <div className="info-detail">
              <p><strong>Descripción:</strong> {grupoData.grp_descripcion || 'Sin descripción'}</p>
              <p><strong>Estado:</strong> {grupoData.grp_estado || 'Activo'}</p>
            </div>
          </div>

          <div className="grupo-view-section">
            <h4><i className="pi pi-users"></i> Niños Asignados ({ninosAsignados.length})</h4>
            <div className="ninos-asignados">
              {ninosAsignados.length > 0 ? (
                <ul className="ninos-list">
                  {ninosAsignados.map((nino) => (
                    <li key={nino.nin_id} className="nino-item">
                      <div className="nino-mini-foto">
                        {nino.nin_foto ? (
                          <img 
                            src={`${process.env.REACT_APP_API_URL}storage/${nino.nin_foto}`} 
                            alt={nino.nin_nombre} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=N';
                            }}
                          />
                        ) : (
                          <div className="foto-placeholder-mini">
                            <i className="pi pi-user"></i>
                          </div>
                        )}
                      </div>
                      <div className="nino-mini-info">
                        <div className="nino-mini-name">{nino.nin_nombre} {nino.nin_apellido}</div>
                        <div className="nino-mini-details">
                          {nino.nin_edad} años | {nino.nin_genero === 'masculino' ? 'M' : 'F'}
                        </div>
                      </div>
                      <div className="nino-mini-status">
                        <span className={`estado-mini ${nino.nin_estado || 'activo'}`}></span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No hay niños asignados a este grupo</p>
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

export default ViewGrupo;
