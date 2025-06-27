import React, { useState, useEffect } from 'react';
import './PdfViewerModal.css';

/**
 * Modal para visualizar archivos PDF
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Indica si el modal está visible
 * @param {function} props.onHide - Función a ejecutar cuando se cierra el modal
 * @param {string} props.url - URL del PDF a visualizar
 * @param {string} props.title - Título del modal
 * @param {string} props.excelUrl - URL para descargar la versión Excel (opcional)
 * @param {function} props.onExcelClick - Función a ejecutar cuando se hace clic en el botón Excel (opcional)
 * @param {boolean} props.showExcelButton - Indica si se debe mostrar el botón de Excel (por defecto true)
 * @param {boolean} props.showPrintButton - Indica si se debe mostrar el botón de Imprimir (por defecto false)
 * @param {boolean} props.showDownloadButton - Indica si se debe mostrar el botón de Descargar (por defecto true)
 */
const PdfViewerModal = (props) => {
    const { 
        visible, 
        onHide, 
        url, 
        title = 'Visualización de PDF',
        excelUrl,
        onExcelClick,
        showExcelButton = true,
        showPrintButton = false,
        showDownloadButton = true
    } = props;
    
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        if (visible && url) {
            setLoading(true);
            setPdfUrl(url);
        }
    }, [visible, url]);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleDownload = () => {
        if (!url) {
            showToast('URL no disponible para descargar.', 'error');
            return;
        }

        showToast('La descarga ha comenzado.', 'success');

        try {
            setTimeout(() => {
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la descarga');
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        const downloadUrl = window.URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        
                        const fileName = url.split('/').pop().split('?')[0] || 'reporte.pdf';
                        link.download = fileName;
                        link.style.display = 'none';
                        
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        window.URL.revokeObjectURL(downloadUrl);
                    })
                    .catch(error => {
                        console.error('Error al descargar archivo:', error);
                        showToast('Error al descargar el archivo.', 'error');
                    });
            }, 300);
        } catch (error) {
            console.error('Error al iniciar la descarga:', error);
            showToast('Error al iniciar la descarga.', 'error');
        }
    };

    const handleExcel = () => {
        showToast('El archivo Excel se está generando y se descargará automáticamente.', 'info');

        try {
            if (!url) {
                showToast('URL no disponible para generar Excel.', 'error');
                return;
            }

            if (onExcelClick && typeof onExcelClick === 'function') {
                onExcelClick();
                return;
            }

            if (excelUrl) {
                setTimeout(() => {
                    window.open(excelUrl, '_blank');
                }, 300);
                return;
            }

            let excelDownloadUrl;
            
            if (url.includes('/pdf/')) {
                const baseUrl = url.split('?')[0];
                const paramsString = url.includes('?') ? url.split('?')[1] : '';
                
                excelDownloadUrl = baseUrl.replace('/pdf/', '/excel/') + (paramsString ? `?${paramsString}` : '');
            } else {
                try {
                    const reportUrl = new URL(url);
                    reportUrl.searchParams.set('tipo', 'excel');
                    excelDownloadUrl = reportUrl.toString();
                } catch (e) {
                    showToast('La conversión a Excel para esta URL no está configurada.', 'warn');
                    return;
                }
            }
            
            setTimeout(() => {
                window.open(excelDownloadUrl, '_blank');
            }, 300);

        } catch (error) {
            console.error("Error constructing Excel URL:", error);
            showToast('No se pudo generar la URL para el archivo Excel.', 'error');
        }
    };

    if (!visible) return null;

    return (
        <div className="pdf-modal-overlay" onClick={onHide}>
            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ show: false, message: '', type: '' })}>
                        <i className="pi pi-times"></i>
                    </button>
                </div>
            )}
            
            <div className="pdf-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="pdf-modal-header">
                    <h3 className="pdf-modal-title">{title}</h3>
                    <div className="pdf-modal-actions">
                        {showExcelButton && (
                            <button 
                                className="btn btn-success"
                                onClick={handleExcel}
                            >
                                <i className="pi pi-file-excel"></i>
                                Excel
                            </button>
                        )}
                        {showDownloadButton && (
                            <button 
                                className="btn btn-primary"
                                onClick={handleDownload}
                            >
                                <i className="pi pi-download"></i>
                                Descargar
                            </button>
                        )}
                        <button 
                            className="btn btn-outline"
                            onClick={onHide}
                        >
                            <i className="pi pi-times"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
                
                <div className="pdf-modal-content">
                    {loading && (
                        <div className="pdf-loading-overlay">
                            <div className="loading-spinner">
                                <i className="pi pi-spin pi-spinner"></i>
                            </div>
                        </div>
                    )}
                    {url && (
                        <iframe 
                            id="pdf-iframe"
                            src={pdfUrl}
                            className="pdf-iframe"
                            onLoad={() => setLoading(false)}
                            title="PDF Viewer"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfViewerModal;