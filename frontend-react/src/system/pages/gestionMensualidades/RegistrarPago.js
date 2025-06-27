import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './GestionMensualidades.css';

const RegistrarPago = ({ mensualidadNino, onVolver }) => {
  const { post } = useApi();
  const [formData, setFormData] = useState({
    mnc_id: '',
    monto: '',
    metodo_pago: 'efectivo',
    numero_recibo: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mensualidadNino) {
      setFormData(prev => ({
        ...prev,
        mnc_id: mensualidadNino.mnc_id,
        monto: mensualidadNino.saldo_pendiente?.toString() || ''
      }));
    }
  }, [mensualidadNino]);

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

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      currencyDisplay: 'code'
    }).format(monto || 0).replace('BOB', 'Bs');
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.monto) {
      newErrors.monto = 'El monto es requerido';
    } else if (parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    } else if (parseFloat(formData.monto) > mensualidadNino.saldo_pendiente) {
      newErrors.monto = `El monto no puede ser mayor al saldo pendiente (${formatMonto(mensualidadNino.saldo_pendiente)})`;
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'El método de pago es requerido';
    }

    if (!formData.fecha_pago) {
      newErrors.fecha_pago = 'La fecha de pago es requerida';
    }

    const fechaPago = new Date(formData.fecha_pago);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    
    if (fechaPago > hoy) {
      newErrors.fecha_pago = 'La fecha de pago no puede ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      const response = await post('/mensualidades/pago', dataToSend);

      if (response.success) {
        alert('Pago registrado exitosamente');
        onVolver();
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          alert(response.message || 'Error al registrar el pago');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al servidor');
    }
    
    setLoading(false);
  };

  if (!mensualidadNino) {
    return <div className="error-message">No se pudo cargar la información de la mensualidad.</div>;
  }

  return (
    <div className="registrar-pago">
      <div className="formulario-header">
        <button className="btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <h2>Registrar Pago</h2>
      </div>

      <div className="pago-info">
        <div className="mensualidad-nino-info-card">
          <h3>Información del Niño</h3>
          <div className="mensualidad-info-row">
            <span className="label">Nombre:</span>
            <span className="value">{mensualidadNino.nino?.nin_nombre} {mensualidadNino.nino?.nin_apellido}</span>
          </div>
          <div className="mensualidad-info-row">
            <span className="label">Precio Total:</span>
            <span className="value">{formatMonto(mensualidadNino.mnc_precio_final)}</span>
          </div>
          <div className="mensualidad-info-row">
            <span className="label">Ya Pagado:</span>
            <span className="value">{formatMonto(mensualidadNino.mnc_monto_pagado || 0)}</span>
          </div>
          <div className="mensualidad-info-row mensualidad-saldo-pendiente">
            <span className="label">Saldo Pendiente:</span>
            <span className="value">{formatMonto(mensualidadNino.saldo_pendiente)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pago-form">
        <div className="form-section">
          <h3>Datos del Pago</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Monto a Pagar (Bs) *</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                className={errors.monto ? 'error' : ''}
                placeholder="0.00"
                min="0.01"
                max={mensualidadNino.saldo_pendiente}
                step="0.01"
              />
              {errors.monto && <span className="error-text">{errors.monto}</span>}
            </div>
            
            <div className="form-group">
              <label>Método de Pago *</label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleInputChange}
                className={errors.metodo_pago ? 'error' : ''}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="cheque">Cheque</option>
                <option value="tarjeta">Tarjeta de Débito/Crédito</option>
              </select>
              {errors.metodo_pago && <span className="error-text">{errors.metodo_pago}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Pago *</label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleInputChange}
                className={errors.fecha_pago ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.fecha_pago && <span className="error-text">{errors.fecha_pago}</span>}
            </div>
            
            <div className="form-group">
              <label>Número de Recibo</label>
              <input
                type="text"
                name="numero_recibo"
                value={formData.numero_recibo}
                onChange={handleInputChange}
                placeholder="Número de recibo o referencia"
                maxLength="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales sobre el pago"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onVolver} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarPago;
