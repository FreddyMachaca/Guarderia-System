import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Portal.css';
import LoginParent from './components/LoginParent';
import LoginStaff from './components/LoginStaff';

const Portal = () => {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      navigate('/');
    }
  };

  if (selectedType) {
    return selectedType === 'parent' ? 
      <LoginParent onBack={handleBack} /> : 
      <LoginStaff onBack={handleBack} />;
  }

  return (
    <div className="portal">
      <div className="portal-container">
        <div className="portal-header">
          <button className="back-btn" onClick={handleBack}>
            ← Volver al inicio
          </button>
          <h1>Ingresar al Portal</h1>
          <p>Selecciona tu tipo de usuario para continuar</p>
        </div>
        
        <div className="portal-cards">
          <div className="portal-card" onClick={() => setSelectedType('parent')}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3>Padre/Madre/Tutor</h3>
            <p>Accede para ver el progreso de tu hijo, comunicarte con los maestros y gestionar información</p>
            <div className="card-arrow">→</div>
          </div>

          <div className="portal-card" onClick={() => setSelectedType('staff')}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>Personal</h3>
            <p>Portal para maestros, administradores y personal de la guardería</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portal;