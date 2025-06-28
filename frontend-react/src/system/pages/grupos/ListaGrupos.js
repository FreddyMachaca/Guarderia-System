import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionGrupos.css';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';
import DataView from '../../components/DataView';

const ListaGrupos = ({ onAgregarGrupo, onEditarGrupo, onVerGrupo }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [viewType, setViewType] = useState('card');
  const { get, put } = useApi();
  
  const {
    currentPage,
    limit,
    pagination,
    handlePageChange,
    handleLimitChange,
    updatePagination
  } = usePagination();

  useEffect(() => {
    cargarGrupos();
  }, [mostrarInactivos, currentPage, limit, searchTerm]);

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (mostrarInactivos) {
        params.append('estado', 'inactivo');
      } else {
        params.append('estado', 'activo');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('page', currentPage);
      params.append('limit', limit);
      
      const response = await get(`/grupos?${params}`);
      if (response.success && response.data) {
        setGrupos(response.data);
        updatePagination(response.pagination);
      } else if (response.data) {
        setGrupos(Array.isArray(response.data) ? response.data : []);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: Array.isArray(response.data) ? response.data.length : 0,
          per_page: limit
        });
      } else {
        setGrupos([]);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: limit
        });
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cargarGrupos();
  };

  const desactivarGrupo = async (grupo) => {
    if (window.confirm('¿Está seguro de desactivar este grupo?')) {
      try {
        const response = await put(`/grupos/${grupo.grp_id}/desactivar`);
        if (response.success) {
          cargarGrupos();
        } else {
          alert(response.message || 'Error al desactivar grupo');
        }
      } catch (error) {
        console.error('Error al desactivar grupo:', error);
        alert('Error al desactivar grupo');
      }
    }
  };

  const activarGrupo = async (grupo) => {
    if (window.confirm('¿Está seguro de activar este grupo?')) {
      try {
        const response = await put(`/grupos/${grupo.grp_id}/activar`);
        if (response.success) {
          cargarGrupos();
        } else {
          alert(response.message || 'Error al activar grupo');
        }
      } catch (error) {
        console.error('Error al activar grupo:', error);
        alert('Error al activar grupo');
      }
    }
  };

  const renderGrupoCard = (grupo) => {
    const ocupacion = grupo.grp_capacidad ? ((grupo.ocupacion || 0) / grupo.grp_capacidad) * 100 : 0;
    const ocupacionClass = 
      ocupacion >= 90 ? 'alta' :
      ocupacion >= 60 ? 'media' : 'baja';

    return (
      <div key={grupo.grp_id} className="grupo-card">
        <div className="grupo-icon">
          <i className="pi pi-building"></i>
        </div>
        <div className="grupo-info">
          <h3>{grupo.grp_nombre}</h3>
          <p><strong>Capacidad:</strong> {grupo.ocupacion || 0}/{grupo.grp_capacidad}</p>
          <p><strong>Edades:</strong> {grupo.grp_edad_minima} - {grupo.grp_edad_maxima} años</p>
          <p><strong>Educador:</strong> {grupo.grp_educador || 'No asignado'}</p>
          <p><strong>Estado:</strong> 
            <span className={`estado ${grupo.grp_estado}`}>
              {grupo.grp_estado}
            </span>
          </p>
          <div className={`ocupacion-barra ${ocupacionClass}`}>
            <div className="ocupacion-progreso" style={{ width: `${Math.min(ocupacion, 100)}%` }}></div>
            <span className="ocupacion-texto">{Math.round(ocupacion)}% ocupado</span>
          </div>
        </div>
        <div className="grupo-actions">
          <button 
            className="btn-view"
            onClick={() => onVerGrupo(grupo)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
          <button 
            className="btn-edit"
            onClick={() => onEditarGrupo(grupo)}
            title="Editar"
          >
            <i className="pi pi-pencil"></i>
          </button>
          {grupo.grp_estado === 'activo' ? (
            <button 
              className="btn-delete"
              onClick={() => desactivarGrupo(grupo)}
              title="Desactivar"
            >
              <i className="pi pi-ban"></i>
            </button>
          ) : (
            <button 
              className="btn-activate"
              onClick={() => activarGrupo(grupo)}
              title="Activar"
            >
              <i className="pi pi-check-circle"></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  const columns = [
    { 
      header: 'Nombre', 
      render: (grupo) => grupo.grp_nombre
    },
    {
      header: 'Capacidad',
      render: (grupo) => `${grupo.ocupacion || 0}/${grupo.grp_capacidad}`
    },
    {
      header: 'Edades',
      render: (grupo) => `${grupo.grp_edad_minima} - ${grupo.grp_edad_maxima} años`
    },
    {
      header: 'Educador',
      render: (grupo) => grupo.grp_educador || 'No asignado'
    },
    {
      header: 'Estado',
      render: (grupo) => (
        <span className={`estado ${grupo.grp_estado}`}>
          {grupo.grp_estado}
        </span>
      )
    }
  ];

  if (loading) {
    return <div className="loading">Cargando grupos...</div>;
  }

  return (
    <div className="lista-grupos">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Grupos/Aulas</h2>
          <p>Gestiona la información de todos los grupos y aulas</p>
        </div>
        <button className="btn-primary" onClick={onAgregarGrupo}>
          <i className="pi pi-plus"></i>
          Agregar Grupo
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-busqueda">
          <i className="pi pi-search" onClick={() => setSearchTerm(searchInput)}></i>
          <input
            type="text"
            placeholder="Buscar por nombre o educador..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
            className="input-busqueda"
          />
        </div>
        <label className="switch-container">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          <span className="switch-label">Mostrar inactivos</span>
        </label>
        
        <div className="view-toggle">
          <button 
            className={viewType === 'card' ? 'active' : ''}
            onClick={() => setViewType('card')}
            title="Ver como tarjetas"
          >
            <i className="pi pi-th-large"></i> Tarjetas
          </button>
          <button 
            className={viewType === 'list' ? 'active' : ''}
            onClick={() => setViewType('list')}
            title="Ver como lista"
          >
            <i className="pi pi-list"></i> Lista
          </button>
        </div>
      </div>

      <DataView
        data={grupos}
        viewType={viewType}
        renderCard={renderGrupoCard}
        columns={columns}
        onEdit={onEditarGrupo}
        onDelete={mostrarInactivos ? activarGrupo : desactivarGrupo}
        onView={onVerGrupo}
        emptyMessage="No se encontraron grupos que coincidan con los filtros"
      />

      <div style={{marginTop: '1rem'}}>
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};

export default ListaGrupos;
