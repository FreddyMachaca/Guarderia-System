import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionGrupos.css';

const FormularioGrupo = ({ grupo, onVolver }) => {
  const { post, put, get } = useApi();
  const [formData, setFormData] = useState({
    grp_nombre: '',
    grp_descripcion: '',
    grp_edad_minima: '',
    grp_edad_maxima: '',
    grp_capacidad: '',
    grp_responsable_id: '',
    grp_estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [personal, setPersonal] = useState([]);

  useEffect(() => {
    cargarPersonal();
    
    if (grupo) {
      setFormData({
        grp_nombre: grupo.grp_nombre || '',
        grp_descripcion: grupo.grp_descripcion || '',
        grp_edad_minima: grupo.grp_edad_minima || '',
        grp_edad_maxima: grupo.grp_edad_maxima || '',
        grp_capacidad: grupo.grp_capacidad || '',
        grp_responsable_id: grupo.grp_responsable_id || '',
        grp_estado: grupo.grp_estado || 'activo'
      });
    }
  }, [grupo]);

  const cargarPersonal = async () => {
    try {
      const response = await get('/personal/lista');
      if (response) {
        setPersonal(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error de conexión al cargar personal:', error);
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

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.grp_nombre.trim()) newErrors.grp_nombre = 'El nombre es requerido';
    if (!formData.grp_edad_minima) newErrors.grp_edad_minima = 'La edad mínima es requerida';
    if (!formData.grp_edad_maxima) newErrors.grp_edad_maxima = 'La edad máxima es requerida';
    if (parseInt(formData.grp_edad_minima) > parseInt(formData.grp_edad_maxima)) {
      newErrors.grp_edad_minima = 'La edad mínima no puede ser mayor que la edad máxima';
    }
    if (!formData.grp_capacidad) newErrors.grp_capacidad = 'La capacidad es requerida';
    if (!formData.grp_responsable_id) newErrors.grp_responsable_id = 'El responsable es requerido';

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
      let response;
      const datosEnvio = {
        nombre: formData.grp_nombre,
        descripcion: formData.grp_descripcion,
        capacidad: parseInt(formData.grp_capacidad),
        edadMinima: parseInt(formData.grp_edad_minima),
        edadMaxima: parseInt(formData.grp_edad_maxima),
        responsableId: parseInt(formData.grp_responsable_id),
        estado: formData.grp_estado
      };
      
      if (grupo) {
        response = await put(`/grupos/${grupo.grp_id}`, datosEnvio);
      } else {
        response = await post('/grupos', datosEnvio);
      }

      if (response.success) {
        onVolver();
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          alert('Error al guardar los datos');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al servidor. Intente de nuevo más tarde.');
    }
    
    setLoading(false);
  };

  return (
    <div className="formulario-grupo">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>{grupo ? 'Editar Grupo/Aula' : 'Agregar Nuevo Grupo/Aula'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grupo-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="grp_nombre"
                value={formData.grp_nombre}
                onChange={handleInputChange}
                className={errors.grp_nombre ? 'error' : ''}
                placeholder="Ej: Sala Infantil 1"
              />
              {errors.grp_nombre && <span className="error-text">{errors.grp_nombre}</span>}
            </div>
            <div className="form-group">
              <label>Educador Responsable *</label>
              <select
                name="grp_responsable_id"
                value={formData.grp_responsable_id}
                onChange={handleInputChange}
                className={errors.grp_responsable_id ? 'error' : ''}
              >
                <option value="">Seleccione un educador</option>
                {personal.map(persona => (
                  <option key={persona.prs_id} value={persona.prs_id}>
                    {persona.usr_nombre} {persona.usr_apellido}
                  </option>
                ))}
              </select>
              {errors.grp_responsable_id && <span className="error-text">{errors.grp_responsable_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Edad Mínima (años) *</label>
              <input
                type="number"
                name="grp_edad_minima"
                min="0"
                value={formData.grp_edad_minima}
                onChange={handleInputChange}
                className={errors.grp_edad_minima ? 'error' : ''}
              />
              {errors.grp_edad_minima && <span className="error-text">{errors.grp_edad_minima}</span>}
            </div>
            <div className="form-group">
              <label>Edad Máxima (años) *</label>
              <input
                type="number"
                name="grp_edad_maxima"
                min="0"
                value={formData.grp_edad_maxima}
                onChange={handleInputChange}
                className={errors.grp_edad_maxima ? 'error' : ''}
              />
              {errors.grp_edad_maxima && <span className="error-text">{errors.grp_edad_maxima}</span>}
            </div>
            <div className="form-group">
              <label>Capacidad Máxima *</label>
              <input
                type="number"
                name="grp_capacidad"
                min="1"
                value={formData.grp_capacidad}
                onChange={handleInputChange}
                className={errors.grp_capacidad ? 'error' : ''}
              />
              {errors.grp_capacidad && <span className="error-text">{errors.grp_capacidad}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="grp_descripcion"
              value={formData.grp_descripcion}
              onChange={handleInputChange}
              placeholder="Descripción del grupo o aula"
              rows="3"
            />
          </div>
        </div>

        {grupo && (
          <div className="form-section">
            <h3>Estado del Grupo</h3>
            <div className="form-group">
              <label>Estado</label>
              <select
                name="grp_estado"
                value={formData.grp_estado}
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
            {loading ? 'Guardando...' : (grupo ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioGrupo;
