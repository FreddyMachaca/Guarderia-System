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
    if (window.confirm('¿Está seguro de desactivar este grupo/aula?')) {
      try {
        const response = await put(`/grupos/${grupo.grp_id}/desactivar`);
        if (response.success) {
          cargarGrupos();
        } else {
          // Manejar el error específico de niños asignados
          if (response.error === 'ASIGNACIONES_ACTIVAS') {
            alert('No es posible desactivar el aula porque tiene niños asignados. Debe reasignar los niños antes de desactivar el aula.');
          } else {
            alert(response.message || 'Error al desactivar grupo');
          }
        }
      } catch (error) {
        // Verificar si el error contiene información específica del servidor
        if (error.response?.data?.error === 'ASIGNACIONES_ACTIVAS') {
          alert('No es posible desactivar el aula porque tiene niños asignados con mensualidades pagas. Debe reasignar los niños antes de desactivar el aula.');
        } else {
          console.error('Error al desactivar grupo:', error);
          alert('Error al desactivar el grupo/aula');
        }
      }
    }
  };

  const activarGrupo = async (grupo) => {
    if (window.confirm('¿Está seguro de activar este grupo/aula?')) {
      try {
        const response = await put(`/grupos/${grupo.grp_id}/activar`);
        if (response.success) {
          cargarGrupos();
        } else {
          alert(response.message || 'Error al activar grupo');
        }
      } catch (error) {
        console.error('Error al activar grupo:', error);
        alert('Error al activar el grupo/aula');
      }
    }
  };
  
  const renderGrupoCard = (grupo) => {
    const ocupacionPorcentaje = Math.floor((grupo.ocupacion / grupo.grp_capacidad) * 100);
    const ocupacionClass = ocupacionPorcentaje >= 90 ? 'alta' : 
                          ocupacionPorcentaje >= 60 ? 'media' : 'baja';
    
    return (
      <div key={grupo.grp_id} className="grupo-card">
        <div className="grupo-icon">
          <i className="pi pi-building"></i>
        </div>
        <h3>{grupo.grp_nombre}</h3>
        <p><strong>Capacidad:</strong> {grupo.ocupacion} / {grupo.grp_capacidad} niños</p>
        <p><strong>Edad:</strong> {grupo.grp_edad_minima} - {grupo.grp_edad_maxima} años</p>
        <p><strong>Responsable:</strong> {grupo.grp_educador || 'No asignado'}</p>
        
        <div className={`ocupacion-barra ${ocupacionClass}`}>
          <div className="ocupacion-progreso" style={{ width: `${ocupacionPorcentaje}%` }}></div>
          <span className="ocupacion-texto">{ocupacionPorcentaje}%</span>
        </div>
        
        <p><strong>Estado:</strong> 
          <span className={`estado ${grupo.grp_estado}`}>
            {grupo.grp_estado}
          </span>
        </p>
        
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
      field: 'grp_nombre'
    },
    {
      header: 'Capacidad',
      render: (grupo) => `${grupo.ocupacion}/${grupo.grp_capacidad}`
    },
    {
      header: 'Rango de edad',
      render: (grupo) => `${grupo.grp_edad_minima} - ${grupo.grp_edad_maxima} años`
    },
    {
      header: 'Responsable',
      field: 'grp_educador',
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
    return <div className="loading">Cargando grupos/aulas...</div>;
  }

  return (
    <div className="lista-grupos">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Grupos/Aulas</h2>
          <p>Gestiona los grupos y aulas de la guardería</p>
        </div>
        <button className="btn-primary" onClick={onAgregarGrupo}>
          <i className="pi pi-plus"></i>
          Agregar Grupo/Aula
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre o responsable..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearchTerm(e.target.value);
            }}
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
            <i className="pi pi-th-large"></i>
          </button>
          <button 
            className={viewType === 'list' ? 'active' : ''}
            onClick={() => setViewType('list')}
            title="Ver como lista"
          >
            <i className="pi pi-list"></i>
          </button>
        </div>
      </div>

      <DataView
        data={grupos}
        viewType={viewType}
        renderCard={renderGrupoCard}
        columns={columns}
        onEdit={onEditarGrupo}
        onDelete={desactivarGrupo}
        onView={onVerGrupo}
        emptyMessage="No se encontraron grupos/aulas que coincidan con los filtros"
        activateItem={activarGrupo}
        mostrarInactivos={mostrarInactivos}
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