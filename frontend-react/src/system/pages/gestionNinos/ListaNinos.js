import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionNinos.css';

const ListaNinos = ({ onAgregarNino, onEditarNino }) => {
  const [ninos, setNinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [grupoFilter, setGrupoFilter] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const { get, del } = useApi();

  useEffect(() => {
    cargarNinos();
    cargarGrupos();
  }, [incluirInactivos]);

  const cargarNinos = async () => {
    try {
      const params = incluirInactivos ? '?incluir_inactivos=true' : '';
      const response = await get(`/ninos${params}`);
      const data = response.data || response || [];
      setNinos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar niños:', error);
      setNinos([]);
    }
    setLoading(false);
  };

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

  const eliminarNino = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este niño?')) {
      try {
        await del(`/ninos/${id}`);
        cargarNinos();
      } catch (error) {
        console.error('Error al eliminar niño:', error);
      }
    }
  };

  const ninosFiltrados = Array.isArray(ninos) ? ninos.filter(nino => {
    const matchSearch = nino.nin_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nino.nin_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nino.nin_ci.includes(searchTerm);
    const matchGrupo = !grupoFilter || nino.grupo_nombre === grupoFilter;
    return matchSearch && matchGrupo;
  }) : [];

  if (loading) {
    return <div className="loading">Cargando niños...</div>;
  }

  return (
    <div className="lista-ninos">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Niños</h2>
          <p>Gestiona la información de todos los niños registrados</p>
        </div>
        <button className="btn-primary" onClick={onAgregarNino}>
          <i className="pi pi-plus"></i>
          Agregar Niño
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-busqueda">
          <i className="pi pi-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-busqueda"
          />
        </div>
        <select
          value={grupoFilter}
          onChange={(e) => setGrupoFilter(e.target.value)}
          className="select-grupo"
        >
          <option value="">Todos los grupos</option>
          {Array.isArray(grupos) && grupos.map(grupo => (
            <option key={grupo.grp_id} value={grupo.grp_nombre}>
              {grupo.grp_nombre}
            </option>
          ))}
        </select>
        <label className="switch-container">
          <input
            type="checkbox"
            checked={incluirInactivos}
            onChange={(e) => setIncluirInactivos(e.target.checked)}
          />
          <span className="switch-label">Incluir inactivos</span>
        </label>
      </div>

      <div className="ninos-grid">
        {ninosFiltrados.map(nino => (
          <div key={nino.nin_id} className="nino-card">
            <div className="nino-foto">
              {nino.nin_foto ? (
                <img src={`${process.env.REACT_APP_API_URL}storage/${nino.nin_foto}`} alt={nino.nin_nombre} />
              ) : (
                <div className="foto-placeholder">
                  <i className="pi pi-user"></i>
                </div>
              )}
            </div>
            <div className="nino-info">
              <h3>{nino.nin_nombre} {nino.nin_apellido}</h3>
              <p><strong>CI:</strong> {nino.nin_ci} {nino.nin_ci_ext}</p>
              <p><strong>Edad:</strong> {nino.nin_edad} años</p>
              <p><strong>Tutor:</strong> {nino.nin_tutor_legal}</p>
              <p><strong>Estado:</strong> 
                <span className={`estado ${nino.nin_estado}`}>
                  {nino.nin_estado || 'activo'}
                </span>
              </p>
              {nino.grupo_actual && (
                <p><strong>Grupo:</strong> {nino.grupo_actual.grp_nombre}</p>
              )}
              {nino.nin_alergias && (
                <p className="alergias"><strong>Alergias:</strong> {nino.nin_alergias}</p>
              )}
            </div>
            <div className="nino-actions">
              <button 
                className="btn-edit"
                onClick={() => onEditarNino(nino)}
                title="Editar"
              >
                <i className="pi pi-pencil"></i>
              </button>
              <button 
                className="btn-delete"
                onClick={() => eliminarNino(nino.nin_id)}
                title="Eliminar"
              >
                <i className="pi pi-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {ninosFiltrados.length === 0 && (
        <div className="no-results">
          <i className="pi pi-search"></i>
          <p>No se encontraron niños que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
};

export default ListaNinos;