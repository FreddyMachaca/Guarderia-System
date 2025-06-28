import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionPadres.css';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';
import DataView from '../../components/DataView';

const ListaPadres = ({ onAgregarPadre, onEditarPadre, onVerPadre }) => {
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [viewType, setViewType] = useState('card'); 
  const { get, del, put } = useApi();
  
  const {
    currentPage,
    limit,
    pagination,
    handlePageChange,
    handleLimitChange,
    updatePagination
  } = usePagination();

  useEffect(() => {
    cargarPadres();
  }, [mostrarInactivos, currentPage, limit, searchTerm]);

  const cargarPadres = async () => {
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
      
      const response = await get(`/padres?${params}`);
      if (response.success && response.data) {
        setPadres(response.data);
        updatePagination(response.pagination);
      } else if (response.data) {
        setPadres(Array.isArray(response.data) ? response.data : []);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: Array.isArray(response.data) ? response.data.length : 0,
          per_page: limit
        });
      } else {
        setPadres([]);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: limit
        });
      }
    } catch (error) {
      console.error('Error al cargar padres:', error);
      setPadres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cargarPadres();
  };

  const eliminarPadre = async (padre) => {
    if (window.confirm('¿Está seguro de desactivar este padre/tutor?')) {
      try {
        await del(`/padres/${padre.pdr_id}`);
        cargarPadres();
      } catch (error) {
        console.error('Error al cambiar estado del padre:', error);
      }
    }
  };

  const activarPadre = async (padre) => {
    if (window.confirm('¿Está seguro de activar este padre/tutor?')) {
      try {
        const response = await put(`/padres/${padre.pdr_id}/activar`);
        if (response.success) {
          cargarPadres();
        } else {
          alert(response.message || 'Error al activar padre');
        }
      } catch (error) {
        console.error('Error al activar padre:', error);
        alert('Error al activar padre');
      }
    }
  };
  
  const renderPadreCard = (padre) => {
    // Validación de seguridad para el objeto usuario
    const usuario = padre.usuario || {};
    const nombreCompleto = usuario.usr_nombre && usuario.usr_apellido 
      ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
      : 'Nombre no disponible';
    
    return (
      <div key={padre.pdr_id} className="padre-card">
        <div className="padre-icon">
          <i className="pi pi-user"></i>
        </div>
        <div className="padre-info">
          <h3>{nombreCompleto}</h3>
          <p><strong>Cédula:</strong> {padre.pdr_ci && padre.pdr_ci_ext ? `${padre.pdr_ci} ${padre.pdr_ci_ext}` : 'No registrada'}</p>
          <p><strong>Email:</strong> {usuario.usr_email || 'No registrado'}</p>
          <p><strong>Teléfono:</strong> {usuario.usr_telefono || 'No registrado'}</p>
          <p><strong>Ocupación:</strong> {padre.pdr_ocupacion || 'No especificada'}</p>
          <p><strong>Niños registrados:</strong> {padre.ninos_registrados || 0}</p>
          <p><strong>Estado:</strong> 
            <span className={`estado ${padre.pdr_estado || 'activo'}`}>
              {padre.pdr_estado || 'activo'}
            </span>
          </p>
          {padre.contacto_emergencia_nombre && (
            <p><strong>Contacto emergencia:</strong> {padre.contacto_emergencia_nombre}</p>
          )}
        </div>
        <div className="padre-actions">
          <button 
            className="btn-view"
            onClick={() => onVerPadre(padre)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
          <button 
            className="btn-edit"
            onClick={() => onEditarPadre(padre)}
            title="Editar"
          >
            <i className="pi pi-pencil"></i>
          </button>
          {(padre.pdr_estado !== 'inactivo') && (
            <button 
              className="btn-delete"
              onClick={() => eliminarPadre(padre)}
              title="Desactivar"
            >
              <i className="pi pi-ban"></i>
            </button>
          )}
          {(padre.pdr_estado === 'inactivo') && (
            <button 
              className="btn-activate"
              onClick={() => activarPadre(padre)}
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
      header: 'Nombre Completo', 
      render: (padre) => {
        const usuario = padre.usuario || {};
        return usuario.usr_nombre && usuario.usr_apellido 
          ? `${usuario.usr_nombre} ${usuario.usr_apellido}` 
          : 'Nombre no disponible';
      }
    },
    {
      header: 'Cédula',
      render: (padre) => padre.pdr_ci && padre.pdr_ci_ext ? `${padre.pdr_ci} ${padre.pdr_ci_ext}` : 'No registrada'
    },
    {
      header: 'Email',
      render: (padre) => {
        const usuario = padre.usuario || {};
        return usuario.usr_email || 'No registrado';
      }
    },
    {
      header: 'Teléfono',
      render: (padre) => {
        const usuario = padre.usuario || {};
        return usuario.usr_telefono || 'No registrado';
      }
    },
    {
      header: 'Niños',
      render: (padre) => padre.ninos_registrados || 0
    },
    {
      header: 'Estado',
      render: (padre) => (
        <span className={`estado ${padre.pdr_estado || 'activo'}`}>
          {padre.pdr_estado || 'activo'}
        </span>
      )
    }
  ];

  if (loading) {
    return <div className="loading">Cargando padres/tutores...</div>;
  }

  return (
    <div className="lista-padres">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Padres/Tutores</h2>
          <p>Gestiona la información de todos los padres y tutores registrados</p>
        </div>
        <button className="btn-primary" onClick={onAgregarPadre}>
          <i className="pi pi-plus"></i>
          Agregar Padre/Tutor
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-busqueda">
          <i className="pi pi-search" onClick={() => setSearchTerm(searchInput)}></i>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, email o CI..."
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
        data={padres}
        viewType={viewType}
        renderCard={renderPadreCard}
        columns={columns}
        onEdit={onEditarPadre}
        onDelete={eliminarPadre}
        onView={onVerPadre}
        emptyMessage="No se encontraron padres/tutores que coincidan con los filtros"
        activarPadre={activarPadre}
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

export default ListaPadres;
