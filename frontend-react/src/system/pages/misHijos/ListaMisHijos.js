import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import './MisHijos.css';

const ListaMisHijos = ({ onVerHijo }) => {
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    cargarMisHijos();
  }, []);

  const cargarMisHijos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get('/mis-hijos');
      if (response.success && response.data) {
        setHijos(response.data);
      } else {
        setHijos([]);
      }
    } catch (error) {
      console.error('Error al cargar mis hijos:', error);
      setHijos([]);
    } finally {
      setLoading(false);
    }
  }, [get]);

  const renderHijoCard = (hijo) => {
    return (
      <div key={hijo.nin_id} className="mis-hijos-card">
        <div className="mis-hijos-foto">
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
          <div className="mis-hijos-foto-placeholder" style={{display: hijo.nin_foto ? 'none' : 'flex'}}>
            <i className="pi pi-user"></i>
          </div>
        </div>
        <div className="mis-hijos-info">
          <h3>{hijo.nin_nombre} {hijo.nin_apellido}</h3>
          <p><strong>Edad:</strong> {hijo.nin_edad} años</p>
          <p><strong>Género:</strong> {hijo.nin_genero === 'masculino' ? 'Masculino' : 'Femenino'}</p>
          <p><strong>Estado:</strong> 
            <span className={`mis-hijos-estado ${hijo.nin_estado}`}>
              {hijo.nin_estado || 'activo'}
            </span>
          </p>
          {hijo.grupo_actual && (
            <p><strong>Grupo:</strong> {hijo.grupo_actual.grp_nombre}</p>
          )}
          {hijo.maestro && (
            <p><strong>Maestro:</strong> {hijo.maestro.nombre_completo}</p>
          )}
          {hijo.nin_alergias && (
            <p className="mis-hijos-alergias"><strong>Alergias:</strong> {hijo.nin_alergias}</p>
          )}
          {hijo.ultima_mensualidad && (
            <div className="mis-hijos-ultimo-pago">
              <div className="mis-hijos-pago-info">
                <span className="mis-hijos-aula-pago">
                  AULA {hijo.grupo_actual?.grp_nombre || 'SIN ASIGNAR'}
                </span>
                <span className={`mis-hijos-estado-pago ${hijo.ultima_mensualidad.estado}`}>
                  Estado de Pago: {hijo.ultima_mensualidad.estado.charAt(0).toUpperCase() + hijo.ultima_mensualidad.estado.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mis-hijos-actions">
          <button 
            className="mis-hijos-btn-view"
            onClick={() => onVerHijo(hijo)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="mis-hijos-loading">Cargando información de mis hijos...</div>;
  }

  return (
    <div className="mis-hijos-lista">
      <div className="mis-hijos-lista-header">
        <div className="mis-hijos-header-title">
          <h2>Mis Hijos</h2>
          <p>Información detallada de todos mis hijos registrados en la guardería</p>
        </div>
      </div>

      <div className="mis-hijos-grid">
        {hijos.length > 0 ? (
          hijos.map(hijo => renderHijoCard(hijo))
        ) : (
          <div className="mis-hijos-no-results">
            <i className="pi pi-users"></i>
            <p>No tienes hijos registrados en la guardería</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaMisHijos;
