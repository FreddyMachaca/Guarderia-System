import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionMensualidades.css';

const ViewMensualidad = ({ mensualidad, onVolver, onRegistrarPago }) => {
  const { get, put } = useApi();
  const [mensualidadData, setMensualidadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNino, setEditingNino] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoDescuento, setNuevoDescuento] = useState('');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    if (mensualidad) {
      cargarDatosMensualidad();
    }
  }, [mensualidad]);

  const cargarDatosMensualidad = async () => {
    setLoading(true);
    try {
      const response = await get(`/mensualidades/${mensualidad.msg_id}`);
      if (response.success && response.data) {
        setMensualidadData(response.data);
      } else {
        setMensualidadData(mensualidad);
      }
    } catch (error) {
      console.error('Error al cargar datos de la mensualidad:', error);
      setMensualidadData(mensualidad);
    } finally {
      setLoading(false);
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      currencyDisplay: 'code'
    }).format(monto || 0).replace('BOB', 'Bs');
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

  const handleEditPrecio = (ninoMensualidad) => {
    setEditingNino(ninoMensualidad.mnc_id);
    setNuevoPrecio(ninoMensualidad.mnc_precio_final);
    setNuevoDescuento(ninoMensualidad.mnc_descuento || 0);
  };

  const handleSavePrecio = async (ninoId, mensualidadNinoId) => {
    try {
      const response = await put(`/mensualidades/${mensualidad.msg_id}/nino/${ninoId}/precio`, {
        precio_final: parseFloat(nuevoPrecio),
        descuento: parseFloat(nuevoDescuento) || 0
      });

      if (response.success) {
        setEditingNino(null);
        cargarDatosMensualidad();
      } else {
        alert('Error al actualizar el precio');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const getEstadoPagoClass = (estado) => {
    switch (estado) {
      case 'pagado': return 'pagado';
      case 'parcial': return 'parcial';
      case 'pendiente': return 'pendiente';
      default: return 'pendiente';
    }
  };

  const calcularPorcentajeCobrado = () => {
    if (!mensualidadData || (mensualidadData.cantidad_ninos || 0) === 0) return 0;
    const totalEsperado = (mensualidadData.msg_precio_base || 0) * (mensualidadData.cantidad_ninos || 0);
    return totalEsperado > 0 ? (((mensualidadData.total_recaudado || 0) / totalEsperado) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  if (!mensualidadData) {
    return <div className="error-message">No se pudo cargar la información de la mensualidad.</div>;
  }

  const porcentajeCobrado = calcularPorcentajeCobrado();

  return (
    <div className="view-mensualidad">
      <div className="view-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles de Mensualidad</h2>
      </div>

      <div className="mensualidad-view-content">
        <div className="mensualidad-view-section principal">
          <div className="mensualidad-icon-large">
            <i className="pi pi-money-bill"></i>
          </div>
          <div className="mensualidad-info-principal">
            <h3>{meses[mensualidadData.msg_mes - 1]} {mensualidadData.msg_anio}</h3>
            <div className="mensualidad-grupo-info">
              <i className="pi pi-building"></i>
              <span>{mensualidadData.grupo?.grp_nombre}</span>
            </div>
            <div className="status-badge">
              <span className={`estado-badge ${mensualidadData.msg_estado}`}>
                {mensualidadData.msg_estado}
              </span>
            </div>
            <div className="mensualidad-info-group">
              <p><i className="pi pi-tag"></i> <strong>Precio Base:</strong> {formatMonto(mensualidadData.msg_precio_base)}</p>
              <p><i className="pi pi-calendar"></i> <strong>Vence:</strong> {formatFecha(mensualidadData.msg_fecha_vencimiento)}</p>
              <p><i className="pi pi-users"></i> <strong>Niños Asignados:</strong> {mensualidadData.cantidad_ninos || 0}</p>
              {mensualidadData.ninos_activos_grupo && mensualidadData.ninos_activos_grupo !== mensualidadData.cantidad_ninos && (
                <p><i className="pi pi-exclamation-triangle"></i> <strong>Niños Activos en Grupo:</strong> {mensualidadData.ninos_activos_grupo}</p>
              )}
              {mensualidadData.necesita_sincronizacion && (
                <div className="warning-message">
                  <i className="pi pi-exclamation-triangle"></i>
                  <span>Hay niños del grupo que no están incluidos en esta mensualidad</span>
                </div>
              )}
            </div>
          </div>
          <div className="resumen-financiero">
            <div className="resumen-item recaudado">
              <div className="resumen-valor">{formatMonto(mensualidadData.total_recaudado || 0)}</div>
              <div className="resumen-label">Recaudado</div>
            </div>
            <div className="resumen-item pendiente">
              <div className="resumen-valor">{formatMonto(mensualidadData.total_pendiente || 0)}</div>
              <div className="resumen-label">Pendiente</div>
            </div>
            <div className="resumen-item porcentaje">
              <div className={`resumen-valor ${porcentajeCobrado >= 80 ? 'success' : porcentajeCobrado >= 50 ? 'warning' : 'danger'}`}>
                {porcentajeCobrado}%
              </div>
              <div className="resumen-label">Cobrado</div>
            </div>
          </div>
        </div>

        <div className="mensualidad-view-tabs">
          {mensualidadData.msg_observaciones && (
            <div className="mensualidad-view-section">
              <h4><i className="pi pi-comment"></i> Observaciones</h4>
              <div className="info-detail">
                <p>{mensualidadData.msg_observaciones}</p>
              </div>
            </div>
          )}

          <div className="mensualidad-view-section">
            <h4><i className="pi pi-users"></i> Detalle por Niño ({mensualidadData.mensualidades_ninos?.length || 0})</h4>
            <div className="ninos-mensualidad">
              {mensualidadData.mensualidades_ninos && mensualidadData.mensualidades_ninos.length > 0 ? (
                <div className="table-container">
                  <table className="ninos-table">
                    <thead>
                      <tr>
                        <th>Niño</th>
                        <th>Precio</th>
                        <th>Descuento</th>
                        <th>Pagado</th>
                        <th>Saldo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensualidadData.mensualidades_ninos.map((ninoMensualidad) => (
                        <tr key={ninoMensualidad.mnc_id}>
                          <td>
                            <div className="nino-info">
                              <div className="nino-nombre">
                                {ninoMensualidad.nino?.nin_nombre} {ninoMensualidad.nino?.nin_apellido}
                              </div>
                              <div className="nino-edad">
                                {ninoMensualidad.nino?.nin_edad} años
                              </div>
                            </div>
                          </td>
                          <td>
                            {editingNino === ninoMensualidad.mnc_id ? (
                              <input
                                type="number"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(e.target.value)}
                                className="input-precio"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              formatMonto(ninoMensualidad.mnc_precio_final)
                            )}
                          </td>
                          <td>
                            {editingNino === ninoMensualidad.mnc_id ? (
                              <input
                                type="number"
                                value={nuevoDescuento}
                                onChange={(e) => setNuevoDescuento(e.target.value)}
                                className="input-descuento"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              formatMonto(ninoMensualidad.mnc_descuento || 0)
                            )}
                          </td>
                          <td>{formatMonto(ninoMensualidad.mnc_monto_pagado || 0)}</td>
                          <td>{formatMonto(ninoMensualidad.saldo_pendiente)}</td>
                          <td>
                            <span className={`estado-pago ${getEstadoPagoClass(ninoMensualidad.mnc_estado_pago)}`}>
                              {ninoMensualidad.mnc_estado_pago}
                            </span>
                          </td>
                          <td>
                            <div className="acciones-nino">
                              {editingNino === ninoMensualidad.mnc_id ? (
                                <>
                                  <button
                                    className="btn-save-small"
                                    onClick={() => handleSavePrecio(ninoMensualidad.mnc_nin_id, ninoMensualidad.mnc_id)}
                                    title="Guardar"
                                  >
                                    <i className="pi pi-check"></i>
                                  </button>
                                  <button
                                    className="btn-cancel-small"
                                    onClick={() => setEditingNino(null)}
                                    title="Cancelar"
                                  >
                                    <i className="pi pi-times"></i>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn-edit-small"
                                    onClick={() => handleEditPrecio(ninoMensualidad)}
                                    title="Editar precio"
                                  >
                                    <i className="pi pi-pencil"></i>
                                  </button>
                                  {ninoMensualidad.mnc_estado_pago !== 'pagado' && (
                                    <button
                                      className="btn-pay-small"
                                      onClick={() => onRegistrarPago(ninoMensualidad)}
                                      title="Registrar pago"
                                    >
                                      <i className="pi pi-money-bill"></i>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No hay niños asignados a esta mensualidad</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="view-actions">
        <button onClick={onVolver} className="btn-secondary">
          <i className="pi pi-arrow-left"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default ViewMensualidad;
