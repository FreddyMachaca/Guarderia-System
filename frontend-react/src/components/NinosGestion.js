import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../system/components/Pagination';
import usePagination from '../system/hooks/usePagination';

const NinosGestion = () => {
    const [ninos, setNinos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [incluirInactivos, setIncluirInactivos] = useState(false);
    
    const {
        currentPage,
        limit,
        pagination,
        handlePageChange,
        handleLimitChange,
        updatePagination
    } = usePagination();

    const fetchNinos = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/ninos', {
                params: {
                    page: currentPage,
                    limit: limit,
                    incluir_inactivos: incluirInactivos
                }
            });

            if (response.data.success) {
                setNinos(response.data.data);
                updatePagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error al cargar niños:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNinos();
    }, [currentPage, limit, incluirInactivos]);

    const handleRefresh = () => {
        fetchNinos();
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Gestión de Niños</h3>
                            <div className="card-tools">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="incluirInactivos"
                                        checked={incluirInactivos}
                                        onChange={(e) => setIncluirInactivos(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="incluirInactivos">
                                        Incluir inactivos
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Cargando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Apellido</th>
                                                    <th>Edad</th>
                                                    <th>CI</th>
                                                    <th>Grupo Actual</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ninos.map(nino => (
                                                    <tr key={nino.nin_id}>
                                                        <td>{nino.nin_nombre}</td>
                                                        <td>{nino.nin_apellido}</td>
                                                        <td>{nino.nin_edad}</td>
                                                        <td>{nino.nin_ci}-{nino.nin_ci_ext}</td>
                                                        <td>
                                                            {nino.grupo_actual ? 
                                                                nino.grupo_actual.grp_nombre : 
                                                                'Sin grupo'
                                                            }
                                                        </td>
                                                        <td>
                                                            <span className={`badge badge-${nino.nin_estado === 'activo' ? 'success' : 'secondary'}`}>
                                                                {nino.nin_estado}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm btn-primary me-1">
                                                                Ver
                                                            </button>
                                                            <button className="btn btn-sm btn-warning me-1">
                                                                Editar
                                                            </button>
                                                            <button className="btn btn-sm btn-danger">
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NinosGestion;