import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';
import './Pagos.css';

const ListaPagos = ({ onVerPago }) => {
  const [pagos, setPagos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [anioFilter, setAnioFilter] = useState(new Date().getFullYear());
  const [mesFilter, setMesFilter] = useState('');
  const { get } = useApi();
  
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
    cargarResumen();
  }, []);

  useEffect(() => {
    cargarPagos();
  }, [currentPage, limit, estadoFilter, anioFilter, mesFilter]);

  const cargarPagos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (estadoFilter) {
        params.append('estado', estadoFilter);
      }
      
      if (anioFilter) {
        params.append('anio', anioFilter);
      }

      if (mesFilter) {
        params.append('mes', mesFilter);
      }
      
      params.append('page', currentPage);
      params.append('limit', limit);
      
      const response = await get(`/pagos?${params}`);
      if (response.success && response.data) {
        setPagos(response.data);
        updatePagination(response.pagination);
      } else {
        setPagos([]);
        updatePagination({
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: limit
        });
      }
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, estadoFilter, anioFilter, mesFilter, get, updatePagination]);

  const cargarResumen = async () => {
    try {
      const response = await get('/pagos/resumen');
      if (response.success) {
        setResumen(response.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  const handleRefresh = () => {
    cargarPagos();
    cargarResumen();
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

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPagoCard = (pago) => {
    return (
      <div key={pago.mnc_id} className="pagos-card">
        <div className="pagos-card-header">
          <div className="pagos-periodo">
            <h3>{formatMes(pago.msg_mes)} {pago.msg_anio}</h3>
            <span className={`pagos-estado-badge ${pago.mnc_estado_pago}`}>
              {pago.mnc_estado_pago}
            </span>
          </div>
          <div className="pagos-hijo">
            <i className="pi pi-user"></i>
            <span>{pago.hijo_nombre}</span>
          </div>
        </div>
        
        <div className="pagos-card-info">
          <div className="pagos-info-row">
            <span className="pagos-label">Grupo:</span>
            <span className="pagos-value">{pago.grp_nombre}</span>
          </div>
          <div className="pagos-info-row">
            <span className="pagos-label">Precio Final:</span>
            <span className="pagos-value">{formatMonto(pago.mnc_precio_final)}</span>
          </div>
          <div className="pagos-info-row">
            <span className="pagos-label">Pagado:</span>
            <span className="pagos-value pagos-success">{formatMonto(pago.mnc_monto_pagado || 0)}</span>
          </div>
          <div className="pagos-info-row">
            <span className="pagos-label">Pendiente:</span>
            <span className={`pagos-value ${pago.saldo_pendiente > 0 ? 'pagos-warning' : 'pagos-success'}`}>
              {formatMonto(pago.saldo_pendiente || 0)}
            </span>
          </div>
          <div className="pagos-info-row">
            <span className="pagos-label">Vencimiento:</span>
            <span className="pagos-value">{formatFecha(pago.msg_fecha_vencimiento)}</span>
          </div>
        </div>

        <div className="pagos-card-actions">
          <button 
            className="pagos-btn-view"
            onClick={() => onVerPago(pago)}
            title="Ver detalles"
          >
            <i className="pi pi-eye"></i>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="pagos-loading">Cargando información de pagos...</div>;
  }

  return (
    <div className="pagos-lista">
      <div className="pagos-lista-header">
        <div className="pagos-header-title">
          <h2>Mis Pagos</h2>
          <p>Historial y estado de todos los pagos de mensualidades</p>
        </div>
      </div>

      <div className="pagos-resumen">
        <div className="pagos-resumen-card">
          <div className="pagos-resumen-icon pagos-success">
            <i className="pi pi-check-circle"></i>
          </div>
          <div className="pagos-resumen-info">
            <h3>Total Pagado</h3>
            <p>{formatMonto(resumen.total_pagado || 0)}</p>
          </div>
        </div>
        <div className="pagos-resumen-card">
          <div className="pagos-resumen-icon pagos-warning">
            <i className="pi pi-clock"></i>
          </div>
          <div className="pagos-resumen-info">
            <h3>Total Pendiente</h3>
            <p>{formatMonto(resumen.total_pendiente || 0)}</p>
          </div>
        </div>
        <div className="pagos-resumen-card">
          <div className="pagos-resumen-icon pagos-danger">
            <i className="pi pi-exclamation-triangle"></i>
          </div>
          <div className="pagos-resumen-info">
            <h3>Vencidos</h3>
            <p>{resumen.mensualidades_vencidas || 0}</p>
          </div>
        </div>
        <div className="pagos-resumen-card">
          <div className="pagos-resumen-icon pagos-info">
            <i className="pi pi-calendar"></i>
          </div>
          <div className="pagos-resumen-info">
            <h3>Próximos a Vencer</h3>
            <p>{resumen.proximos_vencimientos || 0}</p>
          </div>
        </div>
      </div>

      <div className="pagos-filtros">
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="pagos-select-estado"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="parcial">Parcial</option>
          <option value="vencido">Vencido</option>
        </select>
        
        <select
          value={mesFilter}
          onChange={(e) => setMesFilter(e.target.value)}
          className="pagos-select-mes"
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
          className="pagos-input-anio"
          min="2020"
          max="2030"
          placeholder="Año"
        />
      </div>

      <div className="pagos-grid">
        {pagos.length > 0 ? (
          pagos.map(pago => renderPagoCard(pago))
        ) : (
          <div className="pagos-no-results">
            <i className="pi pi-money-bill"></i>
            <p>No se encontraron pagos que coincidan con los filtros</p>
          </div>
        )}
      </div>

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

export default ListaPagos;
