import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './Pagos.css';

const ViewPago = ({ pago, onVolver }) => {
  const { get } = useApi();
  const [pagoData, setPagoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pago) {
      cargarDatosPago();
    }
  }, [pago]);

  const cargarDatosPago = async () => {
    setLoading(true);
    try {
      const response = await get(`/pagos/${pago.mnc_id}`);
      if (response.success && response.data) {
        setPagoData(response.data);
      } else {
        setPagoData(pago);
      }
    } catch (error) {
      console.error('Error al cargar datos del pago:', error);
      setPagoData(pago);
    } finally {
      setLoading(false);
    }
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

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      currencyDisplay: 'code'
    }).format(monto).replace('BOB', 'Bs');
  };

  const formatMes = (mes) => {
    const meses = [
      '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes] || mes;
  };

  if (loading) {
    return <div className="pagos-loading">Cargando información...</div>;
  }

  if (!pagoData) {
    return <div className="pagos-error-message">No se pudo cargar la información del pago.</div>;
  }

  return (
    <div className="pagos-view">
      <div className="pagos-view-header">
        <button className="pagos-btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Detalles del Pago</h2>
      </div>

      <div className="pagos-view-content">
        <div className="pagos-view-section pagos-pago-perfil">
          <div className="pagos-hijo-foto">
            {pagoData.nin_foto ? (
              <img 
                src={pagoData.nin_foto.startsWith('http') 
                  ? pagoData.nin_foto 
                  : `${process.env.REACT_APP_API_URL}storage/${pagoData.nin_foto}`} 
                alt={pagoData.hijo_nombre} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen';
                }}
              />
            ) : (
              <div className="pagos-foto-placeholder">
                <i className="pi pi-user"></i>
              </div>
            )}
          </div>
          <div className="pagos-pago-info-principal">
            <h3>{pagoData.hijo_nombre}</h3>
            <div className="pagos-periodo-badge">
              <span className="pagos-periodo-text">
                {formatMes(pagoData.msg_mes)} {pagoData.msg_anio}
              </span>
            </div>
            <div className="pagos-status-badge">
              <span className={`pagos-estado-badge ${pagoData.mnc_estado_pago}`}>
                {pagoData.mnc_estado_pago}
              </span>
            </div>
            <div className="pagos-info-group">
              <p><i className="pi pi-building"></i> <strong>Grupo:</strong> {pagoData.grp_nombre}</p>
              <p><i className="pi pi-user"></i> <strong>Edad:</strong> {pagoData.nin_edad} años</p>
              <p><i className="pi pi-calendar"></i> <strong>Fecha de Vencimiento:</strong> {formatFecha(pagoData.msg_fecha_vencimiento)}</p>
            </div>
          </div>
        </div>

        <div className="pagos-view-tabs">
          <div className="pagos-view-section">
            <h4><i className="pi pi-money-bill"></i> Información del Pago</h4>
            <div className="pagos-info-detail">
              <div className="pagos-pago-amounts">
                <div className="pagos-amount-item">
                  <span className="pagos-amount-label">Precio Base:</span>
                  <span className="pagos-amount-value">{formatMonto(pagoData.msg_precio_base)}</span>
                </div>
                <div className="pagos-amount-item">
                  <span className="pagos-amount-label">Descuento:</span>
                  <span className="pagos-amount-value pagos-info">{formatMonto(pagoData.mnc_descuento || 0)}</span>
                </div>
                <div className="pagos-amount-item">
                  <span className="pagos-amount-label">Precio Final:</span>
                  <span className="pagos-amount-value pagos-primary">{formatMonto(pagoData.mnc_precio_final)}</span>
                </div>
                <div className="pagos-amount-item">
                  <span className="pagos-amount-label">Monto Pagado:</span>
                  <span className="pagos-amount-value pagos-success">{formatMonto(pagoData.mnc_monto_pagado || 0)}</span>
                </div>
                <div className="pagos-amount-item">
                  <span className="pagos-amount-label">Saldo Pendiente:</span>
                  <span className={`pagos-amount-value ${pagoData.saldo_pendiente > 0 ? 'pagos-warning' : 'pagos-success'}`}>
                    {formatMonto(pagoData.saldo_pendiente || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {pagoData.mnc_observaciones && (
            <div className="pagos-view-section">
              <h4><i className="pi pi-comment"></i> Observaciones</h4>
              <div className="pagos-info-detail">
                <p>{pagoData.mnc_observaciones}</p>
              </div>
            </div>
          )}

          {pagoData.grupo_observaciones && (
            <div className="pagos-view-section">
              <h4><i className="pi pi-info-circle"></i> Observaciones del Grupo</h4>
              <div className="pagos-info-detail">
                <p>{pagoData.grupo_observaciones}</p>
              </div>
            </div>
          )}

          {pagoData.historial_pagos && pagoData.historial_pagos.length > 0 && (
            <div className="pagos-view-section">
              <h4><i className="pi pi-history"></i> Historial de Pagos ({pagoData.historial_pagos.length})</h4>
              <div className="pagos-historial-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Recibo</th>
                      <th>Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagoData.historial_pagos.map((pago, index) => (
                      <tr key={index}>
                        <td>{formatFecha(pago.pgm_fecha_pago)}</td>
                        <td className="pagos-success">{formatMonto(pago.pgm_monto)}</td>
                        <td>
                          <span className="pagos-metodo-badge">
                            {pago.pgm_metodo_pago}
                          </span>
                        </td>
                        <td>{pago.pgm_numero_recibo || 'N/A'}</td>
                        <td>{pago.registrado_por_nombre || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pagos-view-actions">
        <button onClick={onVolver} className="pagos-btn-secondary">
          <i className="pi pi-arrow-left"></i> Volver
        </button>
      </div>
    </div>
  );
};

export default ViewPago;
