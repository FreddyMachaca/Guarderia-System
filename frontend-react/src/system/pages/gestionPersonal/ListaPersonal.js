import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPersonal.css';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';
import DataView from '../../components/DataView';

const ListaPersonal = ({ onAgregarPersonal, onEditarPersonal, onVerPersonal }) => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [viewType, setViewType] = useState('card'); 
  const { get, del } = useApi();
  
  const {
    currentPage,
    limit,
    pagination,
    handlePageChange,
    handleLimitChange,
    updatePagination
  } = usePagination();

  useEffect(() => {
    cargarPersonal();
  }, [mostrarInactivos, currentPage, limit, searchTerm]);

  const cargarPersonal = async () => {
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
      
      const response = await get(`/personal?${params}`);
      if (response.success && response.data) {
        setPersonal(response.data);
        updatePagination(response.pagination);
      } else if (response.data) {
        setPersonal(Array.isArray(response.data) ? response.data : []);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: Array.isArray(response.data) ? response.data.length : 0,
          per_page: limit
        });
      } else {
        setPersonal([]);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: limit
        });
      }
    } catch (error) {
      console.error('Error al cargar personal:', error);
      setPersonal([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cargarPersonal();
  };

  const eliminarPersonal = async (empleado) => {
    if (window.confirm('¿Está seguro de desactivar este empleado?')) {
      try {
        await del(`/personal/${empleado.prs_id}`);
        cargarPersonal();
      } catch (error) {
        console.error('Error al cambiar estado del empleado:', error);
      }
    }
  };
  
  const renderPersonalCard = (empleado) => {
    const usuario = empleado.usuario || {};
    const nombreCompleto = usuario.usr_nombre && usuario.usr_apellido 
      ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
      : 'Nombre no disponible';
    
    return (
      <div key={empleado.prs_id} className="personal-card">
        <div className="personal-foto">
          {empleado.prs_foto ? (
            <img 
              src={
                empleado.prs_foto.startsWith('http')
                  ? empleado.prs_foto
                  : `${process.env.REACT_APP_API_URL}storage/${empleado.prs_foto}`
              }
              alt={nombreCompleto}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="foto-placeholder" style={{display: empleado.prs_foto ? 'none' : 'flex'}}>
            <i className="pi pi-user"></i>
          </div>
        </div>
        <div className="personal-info">
          <h3>{nombreCompleto}</h3>
          <p><strong>Código:</strong> {empleado.prs_codigo_empleado}</p>
          <p><strong>Cargo:</strong> {empleado.prs_cargo}</p>
          {empleado.prs_ci && empleado.prs_ci_expedido && (
            <p><strong>CI:</strong> {empleado.prs_ci} {empleado.prs_ci_expedido}</p>
          )}
          <p><strong>Email:</strong> {usuario.usr_email || 'No registrado'}</p>
          <p><strong>Teléfono:</strong> {usuario.usr_telefono || 'No registrado'}</p>
          <p><strong>Fecha de ingreso:</strong> {empleado.prs_fecha_ingreso || 'No registrada'}</p>
          <p><strong>Grupos asignados:</strong> {empleado.grupos_asignados || 0}</p>
          <p><strong>Estado:</strong> 
            <span className={`estado ${usuario.usr_estado || 'activo'}`}>
              {usuario.usr_estado || 'activo'}
            </span>
          </p>
        </div>
        <div className="personal-actions">
          <button 
            className="btn-view"
            onClick={() => onVerPersonal(empleado)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
          <button 
            className="btn-edit"
            onClick={() => onEditarPersonal(empleado)}
            title="Editar"
          >
            <i className="pi pi-pencil"></i>
          </button>
          {(usuario.usr_estado !== 'inactivo') && (
            <button 
              className="btn-delete"
              onClick={() => eliminarPersonal(empleado)}
              title="Desactivar"
            >
              <i className="pi pi-ban"></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  const columns = [
    { 
      header: 'Nombre Completo', 
      render: (empleado) => {
        const usuario = empleado.usuario || {};
        return usuario.usr_nombre && usuario.usr_apellido 
          ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
          : 'Nombre no disponible';
      }
    },
    {
      header: 'Código',
      field: 'prs_codigo_empleado'
    },
    {
      header: 'Cargo',
      field: 'prs_cargo'
    },
    {
      header: 'Email',
      render: (empleado) => {
        const usuario = empleado.usuario || {};
        return usuario.usr_email || 'No registrado';
      }
    },
    {
      header: 'Fecha Ingreso',
      field: 'prs_fecha_ingreso'
    },
    {
      header: 'Grupos',
      render: (empleado) => empleado.grupos_asignados || 0
    },
    {
      header: 'Estado',
      render: (empleado) => {
        const usuario = empleado.usuario || {};
        return (
          <span className={`estado ${usuario.usr_estado || 'activo'}`}>
            {usuario.usr_estado || 'activo'}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return <div className="loading">Cargando personal...</div>;
  }

  return (
    <div className="lista-personal">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Personal</h2>
          <p>Gestiona la información de todo el personal registrado</p>
        </div>
        <button className="btn-primary" onClick={onAgregarPersonal}>
          <i className="pi pi-plus"></i>
          Agregar Personal
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-busqueda">
          <i className="pi pi-search" onClick={() => setSearchTerm(searchInput)}></i>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, email o código..."
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
        data={personal}
        viewType={viewType}
        renderCard={renderPersonalCard}
        columns={columns}
        onEdit={onEditarPersonal}
        onDelete={eliminarPersonal}
        onView={onVerPersonal}
        emptyMessage="No se encontró personal que coincida con los filtros"
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

export default ListaPersonal;
