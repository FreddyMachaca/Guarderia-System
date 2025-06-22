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
    nin_ci: '',
    nin_ci_ext: 'LP',
    nin_tutor_legal: '',
    nin_alergias: '',
    nin_medicamentos: '',
    nin_observaciones: '',
    nin_estado: 'activo',
    asn_grp_id: ''
  });
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const extensionesCI = [
    'LP', 'CB', 'SC', 'PT', 'TJ', 'OR', 'CH', 'BE', 'PD'
  ];

  useEffect(() => {
    cargarGrupos();
    if (nino) {
      setFormData({
        ...nino,
        nin_fecha_nacimiento: nino.nin_fecha_nacimiento ? nino.nin_fecha_nacimiento.split('T')[0] : ''
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
    if (!formData.nin_ci.trim()) newErrors.nin_ci = 'El CI es requerido';
    if (!formData.nin_tutor_legal.trim()) newErrors.nin_tutor_legal = 'El tutor legal es requerido';

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
        formDataToSend.append(key, formData[key]);
      });

      if (foto) {
        formDataToSend.append('nin_foto', foto);
      }

      const storedToken = localStorage.getItem(`${process.env.REACT_APP_STORAGE_KEY}_token`);
      const url = nino ? `${process.env.REACT_APP_API_PATH}ninos/${nino.nin_id}` : `${process.env.REACT_APP_API_PATH}ninos`;
      const method = nino ? 'POST' : 'POST';
      
      if (nino) {
        formDataToSend.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${storedToken}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        onVolver();
      } else {
        const errorData = await response.json();
        console.error('Error al guardar:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
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

          <div className="form-row">
            <div className="form-group">
              <label>CI *</label>
              <input
                type="text"
                name="nin_ci"
                value={formData.nin_ci}
                onChange={handleInputChange}
                className={errors.nin_ci ? 'error' : ''}
                placeholder="Número de CI"
              />
              {errors.nin_ci && <span className="error-text">{errors.nin_ci}</span>}
            </div>
            <div className="form-group">
              <label>Extensión *</label>
              <select
                name="nin_ci_ext"
                value={formData.nin_ci_ext}
                onChange={handleInputChange}
              >
                {extensionesCI.map(ext => (
                  <option key={ext} value={ext}>{ext}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tutor Legal *</label>
            <input
              type="text"
              name="nin_tutor_legal"
              value={formData.nin_tutor_legal}
              onChange={handleInputChange}
              className={errors.nin_tutor_legal ? 'error' : ''}
              placeholder="Nombre completo del tutor legal"
            />
            {errors.nin_tutor_legal && <span className="error-text">{errors.nin_tutor_legal}</span>}
          </div>
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
              value={formData.nin_alergias}
              onChange={handleInputChange}
              placeholder="Especificar alergias conocidas"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Medicamentos</label>
            <textarea
              name="nin_medicamentos"
              value={formData.nin_medicamentos}
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
            >
              <option value="">Sin asignar</option>
              {Array.isArray(grupos) && grupos.map(grupo => (
                <option key={grupo.grp_id} value={grupo.grp_id}>
                  {grupo.grp_nombre} (Edades: {grupo.grp_edad_minima}-{grupo.grp_edad_maxima})
                </option>
              ))}
            </select>
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
              value={formData.nin_observaciones}
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