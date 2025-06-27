import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPersonal.css';

const FormularioPersonal = ({ personal, onVolver }) => {
  const { post, get } = useApi();
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
    prs_ci: '',
    prs_ci_expedido: '',
    usr_estado: 'activo'
  });
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [empleadoCompleto, setEmpleadoCompleto] = useState(null);

  useEffect(() => {
    if (personal) {
      cargarDatosCompletos();
    } else {
      resetearFormulario();
    }
  }, [personal]);

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      const response = await get(`/personal/${personal.prs_id}`);
      
      if (response.success && response.data) {
        const empleado = response.data;
        setEmpleadoCompleto(empleado);
        cargarDatosEnFormulario(empleado);
      } else {
        cargarDatosEnFormulario(personal);
      }
    } catch (error) {
      console.error('Error al cargar datos completos:', error);
      cargarDatosEnFormulario(personal);
    } finally {
      setLoading(false);
    }
  };

  const resetearFormulario = () => {
    setFormData({
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
      prs_ci: '',
      prs_ci_expedido: '',
      usr_estado: 'activo'
    });
    setPreviewFoto(null);
    setFoto(null);
  };

  const cargarDatosEnFormulario = (empleado) => {
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
      prs_ci: empleado.prs_ci || '',
      prs_ci_expedido: empleado.prs_ci_expedido || '',
      usr_estado: usuario.usr_estado || 'activo'
    });

    if (empleado.prs_foto) {
      const fotoUrl = empleado.prs_foto.startsWith('http') 
        ? empleado.prs_foto 
        : `${process.env.REACT_APP_API_URL}storage/${empleado.prs_foto}`;
      setPreviewFoto(fotoUrl);
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

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB en bytes
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`Formato de imagen no permitido. Solo se permiten archivos: JPEG, PNG, JPG, GIF`);
        e.target.value = '';
        return;
      }
      
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`La imagen es demasiado grande (${fileSizeMB} MB). El tamaño máximo permitido es 2 MB.`);
        e.target.value = '';
        return;
      }
      
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.usr_nombre.trim()) newErrors.usr_nombre = 'El nombre es requerido';
    if (!formData.usr_apellido.trim()) newErrors.usr_apellido = 'El apellido es requerido';
    if (!formData.usr_email.trim()) newErrors.usr_email = 'El email es requerido';
    if (!personal && !formData.usr_password.trim()) newErrors.usr_password = 'La contraseña es requerida';
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
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'usr_password' || formData[key]) {
          formDataToSend.append(key, formData[key] || '');
        }
      });

      if (foto) {
        formDataToSend.append('prs_foto', foto);
      }

      const storedToken = localStorage.getItem(`${process.env.REACT_APP_STORAGE_KEY}_token`);
      
      let response;
      const empleadoId = empleadoCompleto?.prs_id || personal?.prs_id;
      
      if (empleadoId) {
        formDataToSend.append('_method', 'PUT');
        response = await fetch(`${process.env.REACT_APP_API_PATH}personal/${empleadoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          },
          body: formDataToSend
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_API_PATH}personal`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          },
          body: formDataToSend
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onVolver();
        } else {
          console.error('Error en respuesta:', result);
          if (result.errors) {
            setErrors(result.errors);
          }
          alert(result.message || 'Error al guardar los datos');
        }
      } else {
        const errorData = await response.json();
        console.error('Error HTTP:', errorData);
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        alert(errorData.message || 'Error al guardar los datos');
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
        <h2>{personal ? 'Editar Personal' : 'Agregar Nuevo Personal'}</h2>
      </div>

      {loading && !personal ? (
        <div className="loading">Cargando datos del empleado...</div>
      ) : (
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
                <label>Cédula de Identidad</label>
                <input
                  type="text"
                  name="prs_ci"
                  value={formData.prs_ci}
                  onChange={handleInputChange}
                  placeholder="Número de cédula"
                />
              </div>
              <div className="form-group">
                <label>Expedido en</label>
                <select
                  name="prs_ci_expedido"
                  value={formData.prs_ci_expedido}
                  onChange={handleInputChange}
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
              </div>
            </div>

            {personal ? (
              <>
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
                  <label>Nueva Contraseña (dejar vacío para mantener contraseña actual)</label>
                  <input
                    type="password"
                    name="usr_password"
                    value={formData.usr_password}
                    onChange={handleInputChange}
                    className={errors.usr_password ? 'error' : ''}
                    placeholder="Dejar vacío para mantener actual"
                  />
                  {errors.usr_password && <span className="error-text">{errors.usr_password}</span>}
                </div>
              </>
            ) : (
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
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    name="usr_password"
                    value={formData.usr_password}
                    onChange={handleInputChange}
                    className={errors.usr_password ? 'error' : ''}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.usr_password && <span className="error-text">{errors.usr_password}</span>}
                </div>
              </div>
            )}

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
            <h3>Foto del Personal</h3>
            <div className="foto-requirements">
              <p className="requirements-text">
                <i className="pi pi-info-circle"></i>
                <strong>Requisitos de la imagen:</strong> Formatos permitidos: JPEG, PNG, JPG, GIF | Tamaño máximo: 2 MB
              </p>
            </div>
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
                  accept="image/jpeg,image/png,image/jpg,image/gif"
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

          {personal && (
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
              {loading ? 'Guardando...' : (personal ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormularioPersonal;
