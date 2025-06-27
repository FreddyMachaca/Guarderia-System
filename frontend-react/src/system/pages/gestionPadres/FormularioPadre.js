import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPadres.css';

const FormularioPadre = ({ padre, onVolver }) => {
  const { post, put } = useApi();
  const [formData, setFormData] = useState({
    usr_nombre: '',
    usr_apellido: '',
    usr_email: '',
    usr_password: '',
    usr_telefono: '',
    pdr_direccion: '',
    pdr_ocupacion: '',
    pdr_ci: '',
    pdr_ci_ext: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_numero: '',
    pdr_estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (padre) {
      setFormData({
        usr_nombre: padre.usuario?.usr_nombre || '',
        usr_apellido: padre.usuario?.usr_apellido || '',
        usr_email: padre.usuario?.usr_email || '',
        usr_password: '',
        usr_telefono: padre.usuario?.usr_telefono || '',
        pdr_direccion: padre.pdr_direccion || '',
        pdr_ocupacion: padre.pdr_ocupacion || '',
        pdr_ci: padre.pdr_ci || '',
        pdr_ci_ext: padre.pdr_ci_ext || '',
        contacto_emergencia_nombre: padre.contacto_emergencia_nombre || '',
        contacto_emergencia_numero: padre.contacto_emergencia_numero || '',
        pdr_estado: padre.pdr_estado || 'activo'
      });
    }
  }, [padre]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.usr_nombre.trim()) newErrors.usr_nombre = 'El nombre es requerido';
    if (!formData.usr_apellido.trim()) newErrors.usr_apellido = 'El apellido es requerido';
    if (!formData.usr_email.trim()) newErrors.usr_email = 'El email es requerido';
    if (!padre && !formData.usr_password.trim()) newErrors.usr_password = 'La contraseña es requerida';
    if (!formData.pdr_ci.trim()) newErrors.pdr_ci = 'La cédula es requerida';
    if (!formData.pdr_ci_ext.trim()) newErrors.pdr_ci_ext = 'La extensión de cédula es requerida';
    if (!formData.contacto_emergencia_nombre.trim()) newErrors.contacto_emergencia_nombre = 'El nombre del contacto de emergencia es requerido';
    if (!formData.contacto_emergencia_numero.trim()) newErrors.contacto_emergencia_numero = 'El número del contacto de emergencia es requerido';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.usr_email && !emailRegex.test(formData.usr_email)) {
      newErrors.usr_email = 'El formato del email no es válido';
    }

    if (formData.usr_password && formData.usr_password.length < 6) {
      newErrors.usr_password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = { ...formData };
      
      if (padre && !formData.usr_password.trim()) {
        delete dataToSend.usr_password;
      }

      let response;
      if (padre) {
        response = await put(`/padres/${padre.pdr_id}`, dataToSend);
      } else {
        response = await post('/padres', dataToSend);
      }

      if (response.success) {
        onVolver();
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          alert(response.message || 'Error al guardar los datos');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al servidor');
    }
    
    setLoading(false);
  };

  return (
    <div className="formulario-padre">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>{padre ? 'Editar Padre/Tutor' : 'Agregar Nuevo Padre/Tutor'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="padre-form">
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="usr_nombre"
                value={formData.usr_nombre}
                onChange={handleInputChange}
                className={errors.usr_nombre ? 'error' : ''}
                placeholder="Ingrese el nombre"
              />
              {errors.usr_nombre && <span className="error-text">{errors.usr_nombre}</span>}
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="usr_apellido"
                value={formData.usr_apellido}
                onChange={handleInputChange}
                className={errors.usr_apellido ? 'error' : ''}
                placeholder="Ingrese el apellido"
              />
              {errors.usr_apellido && <span className="error-text">{errors.usr_apellido}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cédula de Identidad *</label>
              <input
                type="text"
                name="pdr_ci"
                value={formData.pdr_ci}
                onChange={handleInputChange}
                className={errors.pdr_ci ? 'error' : ''}
                placeholder="Número de cédula"
              />
              {errors.pdr_ci && <span className="error-text">{errors.pdr_ci}</span>}
            </div>
            <div className="form-group">
              <label>Extensión *</label>
              <select
                name="pdr_ci_ext"
                value={formData.pdr_ci_ext}
                onChange={handleInputChange}
                className={errors.pdr_ci_ext ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="LP">La Paz</option>
                <option value="SCZ">Santa Cruz</option>
                <option value="CBBA">Cochabamba</option>
                <option value="OR">Oruro</option>
                <option value="PT">Potosí</option>
                <option value="TJA">Tarija</option>
                <option value="CH">Chuquisaca</option>
                <option value="BE">Beni</option>
                <option value="PD">Pando</option>
                <option value="EX">Extranjero</option>
              </select>
              {errors.pdr_ci_ext && <span className="error-text">{errors.pdr_ci_ext}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="usr_telefono"
              value={formData.usr_telefono}
              onChange={handleInputChange}
              placeholder="Número de teléfono"
            />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <textarea
              name="pdr_direccion"
              value={formData.pdr_direccion}
              onChange={handleInputChange}
              placeholder="Dirección completa"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Ocupación</label>
            <input
              type="text"
              name="pdr_ocupacion"
              value={formData.pdr_ocupacion}
              onChange={handleInputChange}
              placeholder="Ocupación laboral"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Contacto de Emergencia</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Contacto *</label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre}
                onChange={handleInputChange}
                className={errors.contacto_emergencia_nombre ? 'error' : ''}
                placeholder="Nombre completo del contacto"
              />
              {errors.contacto_emergencia_nombre && <span className="error-text">{errors.contacto_emergencia_nombre}</span>}
            </div>
            <div className="form-group">
              <label>Número de Contacto *</label>
              <input
                type="text"
                name="contacto_emergencia_numero"
                value={formData.contacto_emergencia_numero}
                onChange={handleInputChange}
                className={errors.contacto_emergencia_numero ? 'error' : ''}
                placeholder="Número de teléfono"
              />
              {errors.contacto_emergencia_numero && <span className="error-text">{errors.contacto_emergencia_numero}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Credenciales de Acceso</h3>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="usr_email"
              value={formData.usr_email}
              onChange={handleInputChange}
              className={errors.usr_email ? 'error' : ''}
              placeholder="correo@ejemplo.com"
            />
            {errors.usr_email && <span className="error-text">{errors.usr_email}</span>}
          </div>

          <div className="form-group">
            <label>{padre ? 'Nueva Contraseña (dejar vacío para mantene contraseña actual)' : 'Contraseña *'}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="usr_password"
                value={formData.usr_password}
                onChange={handleInputChange}
                className={errors.usr_password ? 'error' : ''}
                placeholder={padre ? 'Nueva contraseña' : 'Contraseña de acceso'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}></i>
              </button>
            </div>
            {errors.usr_password && <span className="error-text">{errors.usr_password}</span>}
          </div>
        </div>

        {padre && (
          <div className="form-section">
            <h3>Estado</h3>
            <div className="form-group">
              <label>Estado del Padre/Tutor</label>
              <select
                name="pdr_estado"
                value={formData.pdr_estado}
                onChange={handleInputChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onVolver} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : (padre ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPadre;
