import React, { useMemo, useCallback } from 'react';
import RequestManager from '../services/RequestManager';

const Pagination = ({ 
    currentPage = 1, 
    totalPages = 1, 
    totalRecords = 0, 
    perPage = 9, 
    onPageChange, 
    onLimitChange, 
    onRefresh 
}) => {
    const paginationStyles = `
        .pagination-container {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .pagination-info {
            color: #6c757d;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        
        .pagination-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .pagination-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .pagination-right {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .pagination-select {
            padding: 0.25rem 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            background-color: #fff;
            font-size: 0.875rem;
            min-width: 120px;
        }
        
        .pagination-refresh {
            padding: 0.375rem 0.75rem;
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.15s ease-in-out;
        }
        
        .pagination-refresh:hover {
            background-color: #5a6268;
        }
        
        .pagination-nav {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .pagination-btn {
            padding: 0.375rem 0.75rem;
            border: 1px solid #dee2e6;
            background-color: #fff;
            color: #495057;
            text-decoration: none;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
            min-width: 40px;
            text-align: center;
            transition: all 0.15s ease-in-out;
        }
        
        .pagination-btn:hover:not(.disabled) {
            background-color: #e9ecef;
            border-color: #adb5bd;
        }
        
        .pagination-btn.active {
            background-color: #007bff;
            border-color: #007bff;
            color: #fff;
        }
        
        .pagination-btn.disabled {
            color: #6c757d;
            background-color: #fff;
            border-color: #dee2e6;
            cursor: not-allowed;
            opacity: 0.65;
        }
        
        .pagination-status {
            color: #6c757d;
            font-size: 0.875rem;
            white-space: nowrap;
        }
        
        @media (max-width: 768px) {
            .pagination-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .pagination-left,
            .pagination-right {
                justify-content: center;
            }
            
            .pagination-nav {
                justify-content: center;
                flex-wrap: wrap;
            }
        }
    `;

    const generatePageNumbers = useMemo(() => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    }, [currentPage, totalPages]);

    const debouncedPageChange = useMemo(() => {
        return RequestManager.debounce((page) => {
            onPageChange && onPageChange(page);
        }, 200);
    }, [onPageChange]);

    const handleLimitChange = useCallback((e) => {
        RequestManager.cancelAllRequests();
        onLimitChange && onLimitChange(parseInt(e.target.value));
        onPageChange && onPageChange(1);
    }, [onLimitChange, onPageChange]);

    const handleRefresh = useCallback(() => {
        RequestManager.cancelAllRequests();
        onRefresh && onRefresh();
    }, [onRefresh]);

    const startRecord = totalRecords > 0 ? ((currentPage - 1) * perPage) + 1 : 0;
    const endRecord = Math.min(currentPage * perPage, totalRecords);

    return (
        <>
            <style>{paginationStyles}</style>
            <div className="pagination-container">
                <div className="pagination-info">
                    Mostrando {startRecord} - {endRecord} de {totalRecords} registros
                </div>
                
                <div className="pagination-controls">
                    <div className="pagination-left">
                        <select 
                            className="pagination-select"
                            value={perPage} 
                            onChange={handleLimitChange}
                        >
                            <option value={9}>9 por página</option>
                            <option value={18}>18 por página</option>
                            <option value={24}>24 por página</option>
                            <option value={30}>30 por página</option>
                        </select>
                        
                        <button 
                            className="pagination-refresh"
                            onClick={handleRefresh}
                            title="Actualizar datos"
                        >
                            ↻ Actualizar
                        </button>
                    </div>
                    
                    <div className="pagination-right">
                        <div className="pagination-nav">
                            <button 
                                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={() => currentPage > 1 && debouncedPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ‹ Anterior
                            </button>
                            
                            {generatePageNumbers.map(page => (
                                <button 
                                    key={page}
                                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => debouncedPageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button 
                                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                                onClick={() => currentPage < totalPages && debouncedPageChange(parseInt(currentPage) + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente ›
                            </button>
                        </div>
                        
                        <div className="pagination-status">
                            Página {currentPage} de {totalPages}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default React.memo(Pagination);