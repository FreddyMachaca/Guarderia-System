import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPadres.css';

const ViewPadres = ({ padre, onVolver }) => {
  const { get, post } = useApi();
  const [padreData, setPadreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (padre) {
      cargarDatosPadre();
    }
  }, [padre]);

  const cargarDatosPadre = async () => {
    setLoading(true);
    try {
      const response = await get(`/padres/${padre.pdr_id}`);
      if (response.success && response.data) {
        setPadreData(response.data);
      } else {
        setPadreData(padre);
      }
    } catch (error) {
      console.error('Error al cargar datos del padre:', error);
      setPadreData(padre);
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

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setResetLoading(true);
    try {
      const response = await post(`/padres/${padre.pdr_id}/reset-password`, {
        nueva_password: newPassword
      });

      if (response.success) {
        alert('Contraseña actualizada exitosamente');
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        alert(response.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  if (!padreData) {
    return <div className="error-message">No se pudo cargar la información del padre/tutor.</div>;
  }

  // Validación de seguridad para el usuario
  const usuario = padreData.usuario || {};
  const nombreCompleto = usuario.usr_nombre && usuario.usr_apellido 
    ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
    : 'Nombre no disponible';

  return (
    <div className="view-padre">
      <div className="view-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles del Padre/Tutor</h2>
      </div>

      <div className="padre-view-content">
        <div className="padre-view-section perfil">
          <div className="padre-icon-large">
            <i className="pi pi-user"></i>
          </div>
          <div className="padre-info-principal">
            <h3>{nombreCompleto}</h3>
            <div className="status-badge">
              <span className={`estado-badge ${padreData.pdr_estado || 'activo'}`}>
                {padreData.pdr_estado || 'activo'}
              </span>
            </div>
            <div className="info-group">
              <p><i className="pi pi-id-card"></i> <strong>Cédula:</strong> {padreData.pdr_ci && padreData.pdr_ci_ext ? `${padreData.pdr_ci} ${padreData.pdr_ci_ext}` : 'No registrada'}</p>
              <p><i className="pi pi-envelope"></i> <strong>Email:</strong> {usuario.usr_email || 'No registrado'}</p>
              <p><i className="pi pi-phone"></i> <strong>Teléfono:</strong> {usuario.usr_telefono || 'No registrado'}</p>
              <p><i className="pi pi-briefcase"></i> <strong>Ocupación:</strong> {padreData.pdr_ocupacion || 'No especificada'}</p>
            </div>
          </div>
        </div>

        <div className="padre-view-tabs">
          <div className="padre-view-section">
            <h4><i className="pi pi-user"></i> Información Personal</h4>
            <div className="info-detail">
              <p><strong>Dirección:</strong> {padreData.pdr_direccion || 'No registrada'}</p>
              <p><strong>Fecha de registro:</strong> {formatFecha(padreData.pdr_fecha_registro)}</p>
              <p><strong>Estado:</strong> {padreData.pdr_estado || 'Activo'}</p>
            </div>
          </div>

          <div className="padre-view-section">
            <h4><i className="pi pi-exclamation-triangle"></i> Contacto de Emergencia</h4>
            <div className="info-detail">
              <p><strong>Nombre:</strong> {padreData.contacto_emergencia_nombre || 'No registrado'}</p>
              <p><strong>Número:</strong> {padreData.contacto_emergencia_numero || 'No registrado'}</p>
            </div>
          </div>

          <div className="padre-view-section">
            <h4><i className="pi pi-key"></i> Credenciales de Acceso</h4>
            <div className="info-detail">
              <p><strong>Email de acceso:</strong> {usuario.usr_email || 'No disponible'}</p>
              <p><strong>Estado de usuario:</strong> {usuario.usr_estado || 'No disponible'}</p>
              <div className="password-actions">
                {!showResetPassword ? (
                  <button 
                    className="btn-reset-password"
                    onClick={() => setShowResetPassword(true)}
                  >
                    <i className="pi pi-key"></i>
                    Cambiar Contraseña
                  </button>
                ) : (
                  <div className="reset-password-form">
                    <div className="form-group">
                      <label>Nueva Contraseña:</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          setShowResetPassword(false);
                          setNewPassword('');
                        }}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                      >
                        {resetLoading ? 'Actualizando...' : 'Actualizar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {padreData.ninos_asociados && padreData.ninos_asociados.length > 0 && (
            <div className="padre-view-section">
              <h4><i className="pi pi-users"></i> Niños Asociados ({padreData.ninos_asociados.length})</h4>
              <div className="ninos-asociados">
                <div className="ninos-list">
                  {padreData.ninos_asociados.map((nino, index) => (
                    <div key={index} className="nino-item">
                      <div className="nino-info">
                        <div className="nino-name">{nino.nombre_completo}</div>
                        <div className="nino-details">
                          {nino.edad} años | {nino.parentesco} | 
                          <span className={`estado ${nino.estado}`}> {nino.estado}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

export default ViewPadres;
