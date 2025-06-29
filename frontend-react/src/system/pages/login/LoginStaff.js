import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import './LoginForm.css';

const LoginStaff = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useApi();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData, 'staff');
      
      if (response.success) {
        navigate('/system/dashboard');
      } else {
        console.error('Error de login:', response.message);
      }
    } catch (err) {
      console.error('Error de login:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <button className="back-btn" onClick={onBack}>
            ← Volver
          </button>
          <h2>Ingreso Personal</h2>
          <p>Portal para maestros y administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@guarderia.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="form-footer">
          <a href="#forgot" className="forgot-link">¿Olvidaste tu contraseña?</a>
          <p>¿Problemas de acceso? <a href="#support">Contacta soporte</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginStaff;