import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPersonal.css';

const ViewPersonal = ({ empleado, onVolver }) => {
  const { get, post } = useApi();
  const [empleadoData, setEmpleadoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (empleado) {
      cargarDatosEmpleado();
    }
  }, [empleado]);

  const cargarDatosEmpleado = async () => {
    setLoading(true);
    try {
      const response = await get(`/personal/${empleado.prs_id}`);
      if (response.success && response.data) {
        setEmpleadoData(response.data);
      } else {
        console.warn('No se pudieron cargar datos adicionales, usando datos base');
        setEmpleadoData(empleado);
      }
    } catch (error) {
      console.error('Error al cargar datos del empleado:', error);
      setEmpleadoData(empleado);
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

  const formatSalario = (salario) => {
    if (!salario) return 'No especificado';
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      currencyDisplay: 'code'
    }).format(salario).replace('BOB', 'Bs');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setResetLoading(true);
    try {
      const response = await post(`/personal/${empleado.prs_id}/reset-password`, {
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

  if (!empleadoData) {
    return <div className="error-message">No se pudo cargar la información del empleado.</div>;
  }

  const usuario = empleadoData.usuario || {};
  const nombreCompleto = usuario.usr_nombre && usuario.usr_apellido 
    ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
    : 'Nombre no disponible';

  return (
    <div className="view-personal">
      <div className="view-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles del Personal</h2>
      </div>

      <div className="personal-view-content">
        <div className="personal-view-section perfil">
          <div className="personal-foto-grande">
            {empleadoData.prs_foto ? (
              <img 
                src={
                  empleadoData.prs_foto.startsWith('http')
                    ? empleadoData.prs_foto
                    : `${process.env.REACT_APP_API_URL}storage/${empleadoData.prs_foto}`
                } 
                alt={nombreCompleto} 
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
          <div className="personal-info-principal">
            <h3>{nombreCompleto}</h3>
            <div className="status-badge">
              <span className={`estado-badge ${usuario.usr_estado || 'activo'}`}>
                {usuario.usr_estado || 'activo'}
              </span>
            </div>
            <div className="info-group">
              <p><i className="pi pi-id-card"></i> <strong>Código:</strong> {empleadoData.prs_codigo_empleado}</p>
              <p><i className="pi pi-briefcase"></i> <strong>Cargo:</strong> {empleadoData.prs_cargo}</p>
              {empleadoData.prs_ci && empleadoData.prs_ci_expedido && (
                <p><i className="pi pi-id-card"></i> <strong>CI:</strong> {empleadoData.prs_ci} {empleadoData.prs_ci_expedido}</p>
              )}
              <p><i className="pi pi-envelope"></i> <strong>Email:</strong> {usuario.usr_email || 'No registrado'}</p>
              <p><i className="pi pi-phone"></i> <strong>Teléfono:</strong> {usuario.usr_telefono || 'No registrado'}</p>
            </div>
          </div>
        </div>

        <div className="personal-view-tabs">
          <div className="personal-view-section">
            <h4><i className="pi pi-user"></i> Información Personal</h4>
            <div className="info-detail">
              <p><strong>Nombre Completo:</strong> {nombreCompleto}</p>
              <p><strong>Email:</strong> {usuario.usr_email || 'No registrado'}</p>
              <p><strong>Teléfono:</strong> {usuario.usr_telefono || 'No registrado'}</p>
              {empleadoData.prs_ci && empleadoData.prs_ci_expedido && (
                <p><strong>Cédula de Identidad:</strong> {empleadoData.prs_ci} {empleadoData.prs_ci_expedido}</p>
              )}
              <p><strong>Estado:</strong> {usuario.usr_estado || 'Activo'}</p>
            </div>
          </div>

          <div className="personal-view-section">
            <h4><i className="pi pi-briefcase"></i> Información Laboral</h4>
            <div className="info-detail">
              <p><strong>Código de Empleado:</strong> {empleadoData.prs_codigo_empleado}</p>
              <p><strong>Cargo:</strong> {empleadoData.prs_cargo}</p>
              <p><strong>Fecha de Ingreso:</strong> {formatFecha(empleadoData.prs_fecha_ingreso)}</p>
              <p><strong>Salario:</strong> {formatSalario(empleadoData.prs_salario)}</p>
              <p><strong>Horario:</strong> {empleadoData.prs_horario || 'No especificado'}</p>
              <p><strong>Fecha de Registro:</strong> {formatFecha(empleadoData.prs_fecha_registro)}</p>
            </div>
          </div>

          <div className="personal-view-section">
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

          {empleadoData.grupos_asignados && empleadoData.grupos_asignados.length > 0 && (
            <div className="personal-view-section">
              <h4><i className="pi pi-users"></i> Grupos Asignados ({empleadoData.grupos_asignados.length})</h4>
              <div className="grupos-asignados">
                <div className="grupos-list">
                  {empleadoData.grupos_asignados.map((grupo, index) => (
                    <div key={index} className="grupo-item">
                      <div className="grupo-info">
                        <div className="grupo-name">{grupo.grp_nombre}</div>
                        <div className="grupo-details">
                          Niños asignados: {grupo.ninos_asignados} | 
                          <span className={`estado ${grupo.grp_estado}`}> {grupo.grp_estado}</span>
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

export default ViewPersonal;
