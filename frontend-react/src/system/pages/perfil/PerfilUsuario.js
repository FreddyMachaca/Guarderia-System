import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useMenus } from '../../hooks/useMenus';
import './PerfilUsuario.css';

const PerfilUsuario = () => {
  const { getCurrentUser, logout, get, put, post } = useApi();
  const { adminMenus, parentMenus, activeMenu, setMenu, isMenuOpen, toggleMenu } = useMenus();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    usr_nombre: '',
    usr_apellido: '',
    usr_email: '',
    usr_telefono: '',
    usr_password: ''
  });
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const user = getCurrentUser();
  const menus = user?.type === 'Tutor' ? parentMenus : adminMenus;
  const puedeEditar = ['personal', 'admin'].includes(user?.type);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const response = await get('/perfil');
      if (response.success) {
        setPerfil(response.data);
        setFormData({
          usr_nombre: response.data.usr_nombre || '',
          usr_apellido: response.data.usr_apellido || '',
          usr_email: response.data.usr_email || '',
          usr_telefono: response.data.usr_telefono || '',
          usr_password: ''
        });
        
        if (response.data.foto_perfil) {
          setPreviewFoto(`${process.env.REACT_APP_API_URL}storage/${response.data.foto_perfil}`);
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
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
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewFoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const guardarFoto = async () => {
    if (!foto) return;
    
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      
      const response = await post('/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.success) {
        setFoto(null);
        cargarPerfil();
        alert('Foto actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrors({});

    try {
      const response = await put('/perfil', formData);
      if (response.success) {
        setEditando(false);
        cargarPerfil();
        alert('Perfil actualizado exitosamente');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      console.error('Error al actualizar perfil:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancel = () => {
    setEditando(false);
    setFormData({
      usr_nombre: perfil.usr_nombre || '',
      usr_apellido: perfil.usr_apellido || '',
      usr_email: perfil.usr_email || '',
      usr_telefono: perfil.usr_telefono || '',
      usr_password: ''
    });
    setErrors({});
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="perfil-usuario">
      <div className={`dashboard-sidebar ${!isMenuOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>Guardería</span>
          </div>
          <div className="sidebar-subtitle">Panel de Administración</div>
        </div>
        
        <nav className="sidebar-menu">
          {menus.map(menu => (
            <button
              key={menu.id}
              className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
              onClick={() => setMenu(menu.id)}
            >
              <i className={`menu-icon ${menu.icon}`} />
              {menu.title}
            </button>
          ))}
        </nav>
      </div>

      <div className={`dashboard-main ${!isMenuOpen ? 'expanded' : ''}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className="pi pi-bars" />
            </button>
            <h1>Mi Perfil</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">Bienvenido, {user?.name}</div>
                <div className="user-role">{user?.type === 'admin' ? 'Administrador' : 'Personal'}</div>
              </div>
              <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            </div>
          </div>
        </header>
        
        <div className="perfil-content">
          <div className="perfil-container">
            <div className="perfil-header">
              <h2>Mi Perfil</h2>
              {puedeEditar && (
                <div className="perfil-actions">
                  {!editando ? (
                    <button className="btn-edit" onClick={() => setEditando(true)}>
                      <i className="pi pi-pencil"></i>
                      Editar
                    </button>
                  ) : (
                    <button className="btn-cancel" onClick={handleCancel}>
                      <i className="pi pi-times"></i>
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="perfil-body">
              <div className="perfil-foto-section">
                <div className="foto-preview">
                  {previewFoto ? (
                    <img src={previewFoto} alt="Perfil" />
                  ) : (
                    <div className="foto-placeholder">
                      <i className="pi pi-user"></i>
                      <p>Sin foto</p>
                    </div>
                  )}
                </div>

                {puedeEditar && editando && (
                  <div className="foto-upload">
                    <input
                      type="file"
                      id="foto-input"
                      accept="image/*"
                      onChange={handleFotoChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="foto-input" className="btn-upload">
                      <i className="pi pi-camera"></i>
                      Cambiar Foto
                    </label>
                    {foto && (
                      <button
                        className="btn-save-foto"
                        onClick={guardarFoto}
                        disabled={subiendoFoto}
                      >
                        {subiendoFoto ? 'Guardando...' : 'Guardar Foto'}
                      </button>
                    )}
                    <div className="foto-requirements">
                      <p>Formatos: JPG, PNG, GIF</p>
                      <p>Tamaño máximo: 2MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="perfil-form">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="usr_nombre"
                        value={formData.usr_nombre}
                        onChange={handleInputChange}
                        disabled={!editando}
                        className={errors.usr_nombre ? 'error' : ''}
                      />
                      {errors.usr_nombre && <span className="error-text">{errors.usr_nombre[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="usr_apellido"
                        value={formData.usr_apellido}
                        onChange={handleInputChange}
                        disabled={!editando}
                        className={errors.usr_apellido ? 'error' : ''}
                      />
                      {errors.usr_apellido && <span className="error-text">{errors.usr_apellido[0]}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="usr_email"
                        value={formData.usr_email}
                        onChange={handleInputChange}
                        disabled={!editando}
                        className={errors.usr_email ? 'error' : ''}
                      />
                      {errors.usr_email && <span className="error-text">{errors.usr_email[0]}</span>}
                    </div>

                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="text"
                        name="usr_telefono"
                        value={formData.usr_telefono}
                        onChange={handleInputChange}
                        disabled={!editando}
                      />
                    </div>
                  </div>

                  {editando && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nueva Contraseña (opcional)</label>
                        <input
                          type="password"
                          name="usr_password"
                          value={formData.usr_password}
                          onChange={handleInputChange}
                          placeholder="Dejar vacío para mantener actual"
                          className={errors.usr_password ? 'error' : ''}
                        />
                        {errors.usr_password && <span className="error-text">{errors.usr_password[0]}</span>}
                      </div>
                    </div>
                  )}

                  <div className="form-info">
                    <div className="info-item">
                      <strong>Tipo de Usuario:</strong> {perfil?.usr_tipo || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Estado:</strong>
                      <span className={`estado ${perfil?.usr_estado || 'activo'}`}>
                        {perfil?.usr_estado || 'activo'}
                      </span>
                    </div>
                  </div>

                  {editando && (
                    <div className="form-actions">
                      <button type="button" className="btn-cancel" onClick={handleCancel}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-save" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  )}
                </form>

                {!puedeEditar && (
                  <div className="readonly-notice">
                    <i className="pi pi-info-circle"></i>
                    <span>Solo el personal administrativo puede editar el perfil</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
          