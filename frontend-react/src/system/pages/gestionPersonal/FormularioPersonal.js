import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPersonal.css';

const FormularioPersonal = ({ empleado, onVolver }) => {
  const { post, put } = useApi();
  const [formData, setFormData] = useState({
    usr_nombre: '',
    usr_apellido: '',
    usr_email: '',
    usr_password: '',
    usr_telefono: '',
    prs_codigo_empleado: '',
    prs_cargo: '',
    prs_fecha_ingreso: '',
    prs_salario: '',
    prs_horario: '',
    usr_estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (empleado) {
      const usuario = empleado.usuario || {};
      
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return fecha;
        }
        if (typeof fecha === 'string' && fecha.includes('T')) {
          return fecha.split('T')[0];
        }
        if (fecha instanceof Date) {
          return fecha.toISOString().split('T')[0];
        }
        try {
          return new Date(fecha).toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formateando fecha:', error);
          return '';
        }
      };

      setFormData({
        usr_nombre: usuario.usr_nombre || '',
        usr_apellido: usuario.usr_apellido || '',
        usr_email: usuario.usr_email || '',
        usr_password: '',
        usr_telefono: usuario.usr_telefono || '',
        prs_codigo_empleado: empleado.prs_codigo_empleado || '',
        prs_cargo: empleado.prs_cargo || '',
        prs_fecha_ingreso: formatearFecha(empleado.prs_fecha_ingreso),
        prs_salario: empleado.prs_salario || '',
        prs_horario: empleado.prs_horario || '',
        usr_estado: usuario.usr_estado || 'activo'
      });
    }
  }, [empleado]);

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
    if (!empleado && !formData.usr_password.trim()) newErrors.usr_password = 'La contraseña es requerida';
    if (!formData.prs_codigo_empleado.trim()) newErrors.prs_codigo_empleado = 'El código de empleado es requerido';
    if (!formData.prs_cargo.trim()) newErrors.prs_cargo = 'El cargo es requerido';
    if (!formData.prs_fecha_ingreso) newErrors.prs_fecha_ingreso = 'La fecha de ingreso es requerida';

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
      
      if (empleado && !dataToSend.usr_password) {
        delete dataToSend.usr_password;
      }

      let response;
      if (empleado) {
        response = await put(`/personal/${empleado.prs_id}`, dataToSend);
      } else {
        response = await post('/personal', dataToSend);
      }

      if (response.success) {
        onVolver();
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        alert(response.message || 'Error al guardar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="formulario-personal">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>{empleado ? 'Editar Personal' : 'Agregar Nuevo Personal'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="personal-form">
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
              <label>Email *</label>
              <input
                type="email"
                name="usr_email"
                value={formData.usr_email}
                onChange={handleInputChange}
                className={errors.usr_email ? 'error' : ''}
                placeholder="ejemplo@correo.com"
              />
              {errors.usr_email && <span className="error-text">{errors.usr_email}</span>}
            </div>
            <div className="form-group">
              <label>{empleado ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
              <input
                type="password"
                name="usr_password"
                value={formData.usr_password}
                onChange={handleInputChange}
                className={errors.usr_password ? 'error' : ''}
                placeholder={empleado ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
              />
              {errors.usr_password && <span className="error-text">{errors.usr_password}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="usr_telefono"
              value={formData.usr_telefono}
              onChange={handleInputChange}
              placeholder="Número de teléfono"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Información Laboral</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Código de Empleado *</label>
              <input
                type="text"
                name="prs_codigo_empleado"
                value={formData.prs_codigo_empleado}
                onChange={handleInputChange}
                className={errors.prs_codigo_empleado ? 'error' : ''}
                placeholder="Código único del empleado"
              />
              {errors.prs_codigo_empleado && <span className="error-text">{errors.prs_codigo_empleado}</span>}
            </div>
            <div className="form-group">
              <label>Cargo *</label>
              <input
                type="text"
                name="prs_cargo"
                value={formData.prs_cargo}
                onChange={handleInputChange}
                className={errors.prs_cargo ? 'error' : ''}
                placeholder="Cargo o puesto de trabajo"
              />
              {errors.prs_cargo && <span className="error-text">{errors.prs_cargo}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Ingreso *</label>
              <input
                type="date"
                name="prs_fecha_ingreso"
                value={formData.prs_fecha_ingreso}
                onChange={handleInputChange}
                className={errors.prs_fecha_ingreso ? 'error' : ''}
              />
              {errors.prs_fecha_ingreso && <span className="error-text">{errors.prs_fecha_ingreso}</span>}
            </div>
            <div className="form-group">
              <label>Salario</label>
              <input
                type="number"
                name="prs_salario"
                value={formData.prs_salario}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Horario</label>
            <input
              type="text"
              name="prs_horario"
              value={formData.prs_horario}
              onChange={handleInputChange}
              placeholder="Ej: Lunes a Viernes 8:00-17:00"
            />
          </div>
        </div>

        {empleado && (
          <div className="form-section">
            <h3>Estado del Empleado</h3>
            <div className="form-group">
              <label>Estado</label>
              <select
                name="usr_estado"
                value={formData.usr_estado}
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
            {loading ? 'Guardando...' : (empleado ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPersonal;
