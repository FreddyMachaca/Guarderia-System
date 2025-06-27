import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionMensualidades.css';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';
import DataView from '../../components/DataView';

const ListaMensualidades = ({ onAgregarMensualidad, onEditarMensualidad, onVerMensualidad }) => {
  const [mensualidades, setMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesFilter, setMesFilter] = useState('');
  const [anioFilter, setAnioFilter] = useState(new Date().getFullYear());
  const [grupoFilter, setGrupoFilter] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [viewType, setViewType] = useState('card');
  const { get, del, post } = useApi();
  
  const {
    currentPage,
    limit,
    pagination,
    handlePageChange,
    handleLimitChange,
    updatePagination
  } = usePagination();

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  useEffect(() => {
    cargarGrupos();
  }, []);

  useEffect(() => {
    cargarMensualidades();
  }, [currentPage, limit, mesFilter, anioFilter, grupoFilter]);

  const cargarMensualidades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (mesFilter) {
        params.append('mes', mesFilter);
      }
      
      if (anioFilter) {
        params.append('anio', anioFilter);
      }

      if (grupoFilter) {
        params.append('grupo', grupoFilter);
      }
      
      params.append('page', currentPage);
      params.append('limit', limit);
      
      const response = await get(`/mensualidades?${params}`);
      if (response.success && response.data) {
        setMensualidades(response.data);
        updatePagination(response.pagination);
      } else {
        setMensualidades([]);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: limit
        });
      }
    } catch (error) {
      console.error('Error al cargar mensualidades:', error);
      setMensualidades([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarGrupos = async () => {
    try {
      const response = await get('/mensualidades/grupos');
      if (response.success) {
        setGrupos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

  const handleRefresh = () => {
    cargarMensualidades();
  };

  const eliminarMensualidad = async (mensualidad) => {
    if (window.confirm('¿Está seguro de eliminar esta mensualidad?')) {
      try {
        await del(`/mensualidades/${mensualidad.msg_id}`);
        cargarMensualidades();
      } catch (error) {
        console.error('Error al eliminar mensualidad:', error);
        alert('Error al eliminar mensualidad');
      }
    }
  };

  const sincronizarNinos = async (mensualidad) => {
    if (window.confirm(`¿Sincronizar ${mensualidad.ninos_faltantes} niños faltantes en la mensualidad de ${formatMes(mensualidad.msg_mes)} ${mensualidad.msg_anio}?`)) {
      try {
        const response = await post(`/mensualidades/${mensualidad.msg_id}/sincronizar-ninos`);
        if (response.success) {
          alert(`${response.ninos_agregados} niños agregados exitosamente`);
          cargarMensualidades();
        } else {
          alert(response.message || 'Error al sincronizar niños');
        }
      } catch (error) {
        console.error('Error al sincronizar niños:', error);
        alert('Error al sincronizar niños');
      }
    }
  };

  const formatMes = (mes) => {
    const mesObj = meses.find(m => m.value === mes);
    return mesObj ? mesObj.label : mes;
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      currencyDisplay: 'code'
    }).format(monto).replace('BOB', 'Bs');
  };

  const renderMensualidadCard = (mensualidad) => {
    const totalEsperado = (mensualidad.msg_precio_base || 0) * (mensualidad.ninos_activos_grupo || 0);
    const porcentajeCobrado = totalEsperado > 0 
      ? (((mensualidad.total_recaudado || 0) / totalEsperado) * 100).toFixed(1)
      : 0;

    return (
      <div key={mensualidad.msg_id} className="mensualidad-card">
        <div className="mensualidad-header">
          <div className="mensualidad-mes-anio">
            <h3>{formatMes(mensualidad.msg_mes)} {mensualidad.msg_anio}</h3>
            <span className={`estado-badge ${mensualidad.msg_estado}`}>
              {mensualidad.msg_estado}
            </span>
          </div>
          <div className="mensualidad-grupo">
            <i className="pi pi-building"></i>
            <span>{mensualidad.grupo?.grp_nombre}</span>
          </div>
        </div>
        
        <div className="mensualidad-info">
          <div className="info-row">
            <span className="label">Precio Base:</span>
            <span className="value">{formatMonto(mensualidad.msg_precio_base)}</span>
          </div>
          <div className="info-row">
            <span className="label">Niños Activos:</span>
            <span className="value">{mensualidad.ninos_activos_grupo || 0}</span>
          </div>
          <div className="info-row">
            <span className="label">En Mensualidad:</span>
            <span className="value">{mensualidad.ninos_en_mensualidad || 0}</span>
          </div>
          <div className="info-row">
            <span className="label">Recaudado:</span>
            <span className="value success">{formatMonto(mensualidad.total_recaudado || 0)}</span>
          </div>
          <div className="info-row">
            <span className="label">Pendiente:</span>
            <span className="value warning">{formatMonto(mensualidad.total_pendiente || 0)}</span>
          </div>
          <div className="info-row">
            <span className="label">% Cobrado:</span>
            <span className={`value ${porcentajeCobrado >= 80 ? 'success' : porcentajeCobrado >= 50 ? 'warning' : 'danger'}`}>
              {porcentajeCobrado}%
            </span>
          </div>
          {mensualidad.necesita_sincronizacion && (
            <div className="info-row warning-row">
              <span className="label">⚠️ Faltan:</span>
              <span className="value warning">{mensualidad.ninos_faltantes} niños</span>
            </div>
          )}
        </div>

        <div className="mensualidad-actions">
          {mensualidad.necesita_sincronizacion && (
            <button 
              className="btn-sync"
              onClick={() => sincronizarNinos(mensualidad)}
              title="Sincronizar niños"
            >
              <i className="pi pi-refresh"></i>
            </button>
          )}
          <button 
            className="btn-view"
            onClick={() => onVerMensualidad(mensualidad)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
          <button 
            className="btn-edit"
            onClick={() => onEditarMensualidad(mensualidad)}
            title="Editar"
          >
            <i className="pi pi-pencil"></i>
          </button>
          <button 
            className="btn-delete"
            onClick={() => eliminarMensualidad(mensualidad)}
            title="Eliminar"
          >
            <i className="pi pi-trash"></i>
          </button>
        </div>
      </div>
    );
  };

  const columns = [
    { 
      header: 'Período',
      render: (mensualidad) => `${formatMes(mensualidad.msg_mes)} ${mensualidad.msg_anio}`
    },
    { 
      header: 'Grupo',
      render: (mensualidad) => mensualidad.grupo?.grp_nombre || 'N/A'
    },
    {
      header: 'Precio Base',
      render: (mensualidad) => formatMonto(mensualidad.msg_precio_base)
    },
    {
      header: 'Niños',
      render: (mensualidad) => (
        <div>
          <span>{mensualidad.ninos_en_mensualidad || 0}/{mensualidad.ninos_activos_grupo || 0}</span>
          {mensualidad.necesita_sincronizacion && (
            <i className="pi pi-exclamation-triangle" style={{color: 'orange', marginLeft: '5px'}} title="Necesita sincronización"></i>
          )}
        </div>
      )
    },
    {
      header: 'Recaudado',
      render: (mensualidad) => formatMonto(mensualidad.total_recaudado || 0)
    },
    {
      header: 'Pendiente',
      render: (mensualidad) => formatMonto(mensualidad.total_pendiente || 0)
    },
    {
      header: 'Estado',
      render: (mensualidad) => (
        <span className={`estado ${mensualidad.msg_estado}`}>
          {mensualidad.msg_estado}
        </span>
      )
    }
  ];

  if (loading) {
    return <div className="loading">Cargando mensualidades...</div>;
  }

  return (
    <div className="lista-mensualidades">
      <div className="lista-header">
        <div className="header-title">
          <h2>Lista de Mensualidades</h2>
          <p>Gestiona las mensualidades de todos los grupos</p>
        </div>
        <button className="btn-primary" onClick={onAgregarMensualidad}>
          <i className="pi pi-plus"></i>
          Crear Mensualidad
        </button>
      </div>

      <div className="filtros">
        <select
          value={mesFilter}
          onChange={(e) => setMesFilter(e.target.value)}
          className="select-mes"
        >
          <option value="">Todos los meses</option>
          {meses.map(mes => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          value={anioFilter}
          onChange={(e) => setAnioFilter(e.target.value)}
          className="input-anio"
          min="2020"
          max="2030"
          placeholder="Año"
        />

        <select
          value={grupoFilter}
          onChange={(e) => setGrupoFilter(e.target.value)}
          className="select-grupo"
        >
          <option value="">Todos los grupos</option>
          {grupos.map(grupo => (
            <option key={grupo.grp_id} value={grupo.grp_id}>
              {grupo.grp_nombre}
            </option>
          ))}
        </select>
        
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
        data={mensualidades}
        viewType={viewType}
        renderCard={renderMensualidadCard}
        columns={columns}
        onEdit={onEditarMensualidad}
        onDelete={eliminarMensualidad}
        onView={onVerMensualidad}
        emptyMessage="No se encontraron mensualidades que coincidan con los filtros"
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

export default ListaMensualidades;
