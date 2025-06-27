import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionMensualidades.css';

const FormularioMensualidad = ({ mensualidad, onVolver }) => {
  const { post, put, get } = useApi();
  const [formData, setFormData] = useState({
    msg_grp_id: '',
    msg_precio_base: '',
    msg_mes: '',
    msg_anio: new Date().getFullYear(),
    msg_fecha_vencimiento: '',
    msg_observaciones: '',
    msg_estado: 'activo'
  });
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  useEffect(() => {
    cargarGrupos();
    
    if (mensualidad) {
      setFormData({
        msg_grp_id: mensualidad.msg_grp_id || '',
        msg_precio_base: mensualidad.msg_precio_base || '',
        msg_mes: mensualidad.msg_mes || '',
        msg_anio: mensualidad.msg_anio || new Date().getFullYear(),
        msg_fecha_vencimiento: mensualidad.msg_fecha_vencimiento || '',
        msg_observaciones: mensualidad.msg_observaciones || '',
        msg_estado: mensualidad.msg_estado || 'activo'
      });
    }
  }, [mensualidad]);

  const cargarGrupos = async () => {
    try {
      const response = await get('/mensualidades/grupos');
      if (response.success) {
        setGrupos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

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

  const getGrupoInfo = () => {
    if (formData.msg_grp_id) {
      const grupo = grupos.find(g => g.grp_id == formData.msg_grp_id);
      return grupo;
    }
    return null;
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.msg_grp_id) newErrors.msg_grp_id = 'El grupo es requerido';
    if (!formData.msg_precio_base) newErrors.msg_precio_base = 'El precio base es requerido';
    if (formData.msg_precio_base && formData.msg_precio_base <= 0) {
      newErrors.msg_precio_base = 'El precio debe ser mayor a 0';
    }
    if (!formData.msg_mes) newErrors.msg_mes = 'El mes es requerido';
    if (!formData.msg_anio) newErrors.msg_anio = 'El año es requerido';
    if (!formData.msg_fecha_vencimiento) newErrors.msg_fecha_vencimiento = 'La fecha de vencimiento es requerida';

    const fechaVencimiento = new Date(formData.msg_fecha_vencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaVencimiento < hoy) {
      newErrors.msg_fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a hoy';
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
      const dataToSend = {
        ...formData,
        msg_precio_base: parseFloat(formData.msg_precio_base),
        msg_mes: parseInt(formData.msg_mes),
        msg_anio: parseInt(formData.msg_anio),
        msg_grp_id: parseInt(formData.msg_grp_id)
      };

      let response;
      if (mensualidad) {
        response = await put(`/mensualidades/${mensualidad.msg_id}`, dataToSend);
      } else {
        response = await post('/mensualidades', dataToSend);
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

  const getMesLabel = (mesValue) => {
    const mes = meses.find(m => m.value === parseInt(mesValue));
    return mes ? mes.label : '';
  };

  return (
    <div className="formulario-mensualidad">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>{mensualidad ? 'Editar Mensualidad' : 'Crear Nueva Mensualidad'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="mensualidad-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Grupo/Aula *</label>
              <select
                name="msg_grp_id"
                value={formData.msg_grp_id}
                onChange={handleInputChange}
                className={errors.msg_grp_id ? 'error' : ''}
                disabled={!!mensualidad}
              >
                <option value="">Seleccionar grupo</option>
                {grupos.map(grupo => (
                  <option key={grupo.grp_id} value={grupo.grp_id}>
                    {grupo.grp_nombre} ({grupo.ninos_activos || 0} niños activos)
                  </option>
                ))}
              </select>
              {errors.msg_grp_id && <span className="error-text">{errors.msg_grp_id}</span>}
              {getGrupoInfo() && (
                <div className="grupo-info">
                  <small>
                    ℹ️ Este grupo tiene {getGrupoInfo().ninos_activos || 0} niños activos. 
                    Se crearán mensualidades individuales para cada uno.
                  </small>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Precio Base (Bs) *</label>
              <input
                type="number"
                name="msg_precio_base"
                value={formData.msg_precio_base}
                onChange={handleInputChange}
                className={errors.msg_precio_base ? 'error' : ''}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.msg_precio_base && <span className="error-text">{errors.msg_precio_base}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mes *</label>
              <select
                name="msg_mes"
                value={formData.msg_mes}
                onChange={handleInputChange}
                className={errors.msg_mes ? 'error' : ''}
                disabled={!!mensualidad}
              >
                <option value="">Seleccionar mes</option>
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
              {errors.msg_mes && <span className="error-text">{errors.msg_mes}</span>}
            </div>
            <div className="form-group">
              <label>Año *</label>
              <input
                type="number"
                name="msg_anio"
                value={formData.msg_anio}
                onChange={handleInputChange}
                className={errors.msg_anio ? 'error' : ''}
                min="2020"
                max="2030"
                disabled={!!mensualidad}
              />
              {errors.msg_anio && <span className="error-text">{errors.msg_anio}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Fecha de Vencimiento *</label>
            <input
              type="date"
              name="msg_fecha_vencimiento"
              value={formData.msg_fecha_vencimiento}
              onChange={handleInputChange}
              className={errors.msg_fecha_vencimiento ? 'error' : ''}
            />
            {errors.msg_fecha_vencimiento && <span className="error-text">{errors.msg_fecha_vencimiento}</span>}
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="msg_observaciones"
              value={formData.msg_observaciones}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales sobre esta mensualidad"
              rows="3"
            />
          </div>
        </div>

        {mensualidad && (
          <div className="form-section">
            <h3>Estado</h3>
            <div className="form-group">
              <label>Estado de la Mensualidad</label>
              <select
                name="msg_estado"
                value={formData.msg_estado}
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
            {loading ? 'Guardando...' : (mensualidad ? 'Actualizar' : 'Crear Mensualidad')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioMensualidad;
