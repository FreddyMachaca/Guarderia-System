import React from 'react';
import './DataView.css';

const DataView = ({ 
  data, 
  viewType, 
  renderCard, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  emptyMessage 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="no-results">
        <i className="pi pi-search"></i>
        <p>{emptyMessage || "No se encontraron resultados"}</p>
      </div>
    );
  }

  if (viewType === 'card') {
    return (
      <div className="data-cards-grid">
        {data.map((item, index) => renderCard(item, index))}
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={column.style || {}}>
                {column.header}
              </th>
            ))}
            <th className="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} style={column.style || {}}>
                  {column.render 
                    ? column.render(item) 
                    : item[column.field]}
                </td>
              ))}
              <td className="actions-column">
                <div className="row-actions">
                  {onView && (
                    <button 
                      className="btn-table-view"
                      onClick={() => onView(item)}
                      title="Ver detalles"
                    >
                      <i className="pi pi-eye"></i>
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      className="btn-table-edit"
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      <i className="pi pi-pencil"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="btn-table-delete"
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                    >
                      <i className="pi pi-ban"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataView;
