import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionNinos.css';

const FormularioNino = ({ nino, onVolver }) => {
  const { get, post, put } = useApi();
  const [formData, setFormData] = useState({
    nin_nombre: '',
    nin_apellido: '',
    nin_fecha_nacimiento: '',
    nin_edad: '',
    nin_genero: '',
    nin_tutor_legal: '',
    rel_parentesco: '',
    nin_alergias: '',
    nin_medicamentos: '',
    nin_observaciones: '',
    nin_estado: 'activo',
    asn_grp_id: ''
  });
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showParentesco, setShowParentesco] = useState(false);

  useEffect(() => {
    cargarGrupos();
    cargarPadres();
    if (nino) {
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

      const tutorLegalId = nino.relacionesPadres && nino.relacionesPadres.length > 0 
        ? nino.relacionesPadres[0].rel_pdr_id 
        : '';

      const parentesco = nino.relacionesPadres && nino.relacionesPadres.length > 0 
        ? nino.relacionesPadres[0].rel_parentesco 
        : '';

      setFormData({
        nin_nombre: nino.nin_nombre || '',
        nin_apellido: nino.nin_apellido || '',
        nin_fecha_nacimiento: formatearFecha(nino.nin_fecha_nacimiento),
        nin_edad: nino.nin_edad || '',
        nin_genero: nino.nin_genero || '',
        nin_tutor_legal: tutorLegalId,
        rel_parentesco: parentesco,
        nin_alergias: nino.nin_alergias || '',
        nin_medicamentos: nino.nin_medicamentos || '',
        nin_observaciones: nino.nin_observaciones || '',
        nin_estado: nino.nin_estado || 'activo',
        asn_grp_id: nino.grupo_actual ? nino.grupo_actual.grp_id : ''
      });

      setShowParentesco(!!tutorLegalId);
      
      if (nino.nin_foto) {
        setPreviewFoto(`${process.env.REACT_APP_API_URL}storage/${nino.nin_foto}`);
      }
    }
  }, [nino]);

  const cargarGrupos = async () => {
    try {
      const response = await get('/grupos');
      const data = response.data || response || [];
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      setGrupos([]);
    }
  };

  const cargarPadres = async () => {
    try {
      const response = await get('/ninos/padres-disponibles');
      if (response.success && response.data) {
        setPadres(response.data);
      }
    } catch (error) {
      console.error('Error al cargar padres:', error);
      setPadres([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'nin_tutor_legal') {
      setShowParentesco(!!value);
      if (!value) {
        setFormData(prev => ({
          ...prev,
          rel_parentesco: ''
        }));
      }
    }

    if (name === 'nin_fecha_nacimiento' && value) {
      const edad = calcularEdad(value);
      setFormData(prev => ({
        ...prev,
        nin_edad: edad
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nin_nombre.trim()) newErrors.nin_nombre = 'El nombre es requerido';
    if (!formData.nin_apellido.trim()) newErrors.nin_apellido = 'El apellido es requerido';
    if (!formData.nin_fecha_nacimiento) newErrors.nin_fecha_nacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.nin_genero) newErrors.nin_genero = 'El género es requerido';
    if (!formData.nin_tutor_legal) newErrors.nin_tutor_legal = 'El tutor legal es requerido';
    if (formData.nin_tutor_legal && !formData.rel_parentesco.trim()) newErrors.rel_parentesco = 'El parentesco es requerido';

    // Validar rango de edad si se selecciona un grupo
    if (formData.asn_grp_id && formData.nin_edad) {
      const grupoSeleccionado = grupos.find(grupo => grupo.grp_id == formData.asn_grp_id);
      if (grupoSeleccionado) {
        const edad = parseInt(formData.nin_edad);
        const edadMinima = parseInt(grupoSeleccionado.grp_edad_minima);
        const edadMaxima = parseInt(grupoSeleccionado.grp_edad_maxima);
        
        if (edad < edadMinima || edad > edadMaxima) {
          newErrors.asn_grp_id = `La edad del niño (${edad} años) está fuera del rango permitido para este grupo (${edadMinima}-${edadMaxima} años)`;
        }
      }
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
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'asn_grp_id') {
          formDataToSend.append(key, formData[key] || '');
        }
      });

      // Si hay seleccionado un grupo, agregarlo como grupo_id para que el backend lo procese
      if (formData.asn_grp_id) {
        formDataToSend.append('grupo_id', formData.asn_grp_id);
      }

      if (foto) {
        formDataToSend.append('nin_foto', foto);
      }

      const storedToken = localStorage.getItem(`${process.env.REACT_APP_STORAGE_KEY}_token`);
      
      let response;
      if (nino) {
        formDataToSend.append('_method', 'PUT');
        response = await fetch(`${process.env.REACT_APP_API_PATH}ninos/${nino.nin_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          },
          body: formDataToSend
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_API_PATH}ninos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          },
          body: formDataToSend
        });
      }

      if (response.ok) {
        const result = await response.json();
        onVolver();
      } else {
        const errorData = await response.json();
        console.error('Error al guardar:', errorData);
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        alert('Error al guardar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div className="formulario-nino">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>{nino ? 'Editar Niño' : 'Agregar Nuevo Niño'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="nino-form">
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nin_nombre"
                value={formData.nin_nombre}
                onChange={handleInputChange}
                className={errors.nin_nombre ? 'error' : ''}
                placeholder="Ingrese el nombre"
              />
              {errors.nin_nombre && <span className="error-text">{errors.nin_nombre}</span>}
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="nin_apellido"
                value={formData.nin_apellido}
                onChange={handleInputChange}
                className={errors.nin_apellido ? 'error' : ''}
                placeholder="Ingrese el apellido"
              />
              {errors.nin_apellido && <span className="error-text">{errors.nin_apellido}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="nin_fecha_nacimiento"
                value={formData.nin_fecha_nacimiento}
                onChange={handleInputChange}
                className={errors.nin_fecha_nacimiento ? 'error' : ''}
              />
              {errors.nin_fecha_nacimiento && <span className="error-text">{errors.nin_fecha_nacimiento}</span>}
            </div>
            <div className="form-group">
              <label>Edad</label>
              <input
                type="number"
                name="nin_edad"
                value={formData.nin_edad}
                readOnly
                className="readonly"
              />
            </div>
            <div className="form-group">
              <label>Género *</label>
              <select
                name="nin_genero"
                value={formData.nin_genero}
                onChange={handleInputChange}
                className={errors.nin_genero ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
              {errors.nin_genero && <span className="error-text">{errors.nin_genero}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Tutor Legal *</label>
            <select
              name="nin_tutor_legal"
              value={formData.nin_tutor_legal}
              onChange={handleInputChange}
              className={errors.nin_tutor_legal ? 'error' : ''}
            >
              <option value="">Seleccionar tutor legal</option>
              {padres.map(padre => (
                <option key={padre.pdr_id} value={padre.pdr_id}>
                  {padre.nombre_completo}
                </option>
              ))}
            </select>
            {errors.nin_tutor_legal && <span className="error-text">{errors.nin_tutor_legal}</span>}
          </div>

          {showParentesco && (
            <div className="form-group">
              <label>Parentesco *</label>
              <select
                name="rel_parentesco"
                value={formData.rel_parentesco}
                onChange={handleInputChange}
                className={errors.rel_parentesco ? 'error' : ''}
              >
                <option value="">Seleccionar parentesco</option>
                <option value="padre">Padre</option>
                <option value="madre">Madre</option>
                <option value="abuelo">Abuelo</option>
                <option value="abuela">Abuela</option>
                <option value="tio">Tío</option>
                <option value="tia">Tía</option>
                <option value="tutor">Tutor Legal</option>
                <option value="otro">Otro</option>
              </select>
              {errors.rel_parentesco && <span className="error-text">{errors.rel_parentesco}</span>}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Foto del Niño</h3>
          <div className="foto-upload">
            <div className="foto-preview">
              {previewFoto ? (
                <img src={previewFoto} alt="Preview" />
              ) : (
                <div className="foto-placeholder">
                  <i className="pi pi-camera"></i>
                  <p>Sin foto</p>
                </div>
              )}
            </div>
            <div className="foto-input">
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleFotoChange}
              />
              <label htmlFor="foto" className="btn-upload">
                <i className="pi pi-upload"></i>
                Seleccionar Foto
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Información Médica</h3>
          <div className="form-group">
            <label>Alergias</label>
            <textarea
              name="nin_alergias"
              value={formData.nin_alergias || ''}
              onChange={handleInputChange}
              placeholder="Especificar alergias conocidas"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Medicamentos</label>
            <textarea
              name="nin_medicamentos"
              value={formData.nin_medicamentos || ''}
              onChange={handleInputChange}
              placeholder="Medicamentos que toma regularmente"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Asignación a Grupo</h3>
          <div className="form-group">
            <label>Grupo/Aula</label>
            <select
              name="asn_grp_id"
              value={formData.asn_grp_id}
              onChange={handleInputChange}
              className={errors.asn_grp_id ? 'error' : ''}
            >
              <option value="">Sin asignar</option>
              {Array.isArray(grupos) && grupos.map(grupo => (
                <option key={grupo.grp_id} value={grupo.grp_id}>
                  {grupo.grp_nombre} (Edades: {grupo.grp_edad_minima}-{grupo.grp_edad_maxima})
                </option>
              ))}
            </select>
            {errors.asn_grp_id && <span className="error-text">{errors.asn_grp_id}</span>}
          </div>
        </div>

        {nino && (
          <div className="form-section">
            <h3>Estado del Niño</h3>
            <div className="form-group">
              <label>Estado</label>
              <select
                name="nin_estado"
                value={formData.nin_estado}
                onChange={handleInputChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="nin_observaciones"
              value={formData.nin_observaciones || ''}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onVolver} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : (nino ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioNino;