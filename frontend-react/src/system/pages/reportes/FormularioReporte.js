import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import PdfViewerModal from '../../components/PdfViewerModal';
import './GestionReportes.css';

const FormularioReporte = ({ tipoReporte, onVolver }) => {
  const { get } = useApi();
  const [formData, setFormData] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    grupo_id: '',
    estado: ''
  });
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tipoReporte?.id === 'ninos-inscritos' || tipoReporte?.id === 'asignaciones') {
      cargarGrupos();
    }
  }, [tipoReporte]);

  const cargarGrupos = async () => {
    try {
      const response = await get('/grupos');
      setGrupos(response.data || []);
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

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

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const construirUrlReporte = (tipo = 'pdf') => {
    const params = new URLSearchParams();
    
    params.append('fecha_inicio', formData.fecha_inicio);
    params.append('fecha_fin', formData.fecha_fin);
    params.append('tipo', tipo);

    if (formData.grupo_id) {
      params.append('grupo_id', formData.grupo_id);
    }

    if (formData.estado) {
      params.append('estado', formData.estado);
    }

    return `${process.env.REACT_APP_API_PATH}reportes/${tipoReporte.id}?${params.toString()}`;
  };

  const handleGenerarReporte = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const url = construirUrlReporte('pdf');
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarExcel = () => {
    if (!validarFormulario()) {
      return;
    }

    const url = construirUrlReporte('excel');
    window.open(url, '_blank');
  };

  const getOpcionesEspecificas = () => {
    switch (tipoReporte?.id) {
      case 'ninos-inscritos':
      case 'asignaciones':
        return (
          <div className="rpt-form-group">
            <label>Filtrar por Grupo (Opcional)</label>
            <select
              name="grupo_id"
              value={formData.grupo_id}
              onChange={handleInputChange}
              className="rpt-form-select"
            >
              <option value="">Todos los grupos</option>
              {grupos.map(grupo => (
                <option key={grupo.grp_id} value={grupo.grp_id}>
                  {grupo.grp_nombre}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'pagos':
        return (
          <div className="rpt-form-group">
            <label>Estado de Pago (Opcional)</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="rpt-form-select"
            >
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!tipoReporte) {
    return <div className="rpt-error">No se ha seleccionado un tipo de reporte</div>;
  }

  return (
    <div className="rpt-formulario-reporte">
      <div className="rpt-formulario-header">
        <button className="rpt-btn-back" onClick={onVolver}>
          <i className="pi pi-arrow-left"></i>
          Volver
        </button>
        <div className="rpt-header-info">
          <h2>{tipoReporte.titulo}</h2>
          <p>{tipoReporte.descripcion}</p>
        </div>
      </div>

      <div className="rpt-formulario-content">
        <div className="rpt-form-card">
          <div className="rpt-card-header">
            <i className={tipoReporte.icono}></i>
            <h3>Configuración del Reporte</h3>
          </div>

          <form className="rpt-reporte-form">
            <div className="rpt-form-section">
              <h4>Rango de Fechas</h4>
              <div className="rpt-form-row">
                <div className="rpt-form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className={`rpt-form-input ${errors.fecha_inicio ? 'rpt-error' : ''}`}
                  />
                  {errors.fecha_inicio && <span className="rpt-error-text">{errors.fecha_inicio}</span>}
                </div>
                <div className="rpt-form-group">
                  <label>Fecha de Fin *</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className={`rpt-form-input ${errors.fecha_fin ? 'rpt-error' : ''}`}
                  />
                  {errors.fecha_fin && <span className="rpt-error-text">{errors.fecha_fin}</span>}
                </div>
              </div>
            </div>

            {getOpcionesEspecificas() && (
              <div className="rpt-form-section">
                <h4>Opciones Específicas</h4>
                {getOpcionesEspecificas()}
              </div>
            )}

            <div className="rpt-form-actions">
              <button 
                type="button" 
                onClick={onVolver} 
                className="rpt-btn-cancel"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleDescargarExcel}
                className="rpt-btn-excel"
                disabled={loading}
              >
                <i className="pi pi-file-excel"></i>
                Descargar Excel
              </button>
              <button 
                type="button" 
                onClick={handleGenerarReporte}
                className="rpt-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="pi pi-spin pi-spinner"></i>
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="pi pi-file-pdf"></i>
                    Ver Reporte PDF
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="rpt-info-panel">
          <div className="rpt-info-item">
            <i className="pi pi-calendar"></i>
            <div>
              <strong>Período Seleccionado</strong>
              <p>{formData.fecha_inicio} al {formData.fecha_fin}</p>
            </div>
          </div>
          <div className="rpt-info-item">
            <i className="pi pi-file-pdf"></i>
            <div>
              <strong>Formato PDF</strong>
              <p>Visualización e impresión</p>
            </div>
          </div>
          <div className="rpt-info-item">
            <i className="pi pi-file-excel"></i>
            <div>
              <strong>Formato Excel</strong>
              <p>Análisis de datos</p>
            </div>
          </div>
        </div>
      </div>

      <PdfViewerModal
        visible={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        url={pdfUrl}
        title={`${tipoReporte.titulo} - ${formData.fecha_inicio} al ${formData.fecha_fin}`}
        onExcelClick={handleDescargarExcel}
        showExcelButton={true}
        showPrintButton={false}
        showDownloadButton={true}
      />
    </div>
  );
};

export default FormularioReporte;
