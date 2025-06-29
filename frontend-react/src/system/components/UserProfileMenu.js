import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfileMenu.css';

const UserProfileMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/system/perfil');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  const getFotoUrl = () => {
    if (user?.foto_perfil) {
      return `${process.env.REACT_APP_API_URL}storage/${user.foto_perfil}`;
    }
    return null;
  };

  const getUserRoleLabel = () => {
    const userType = user?.type || user?.usr_tipo;
    
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'personal':
      case 'staff':
        return 'Personal';
      case 'parent':
      case 'Tutor':
        return 'Padre/Madre';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="user-profile-menu" ref={menuRef}>
      <div className="user-profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">
          {getFotoUrl() ? (
            <img src={getFotoUrl()} alt="Perfil" />
          ) : (
            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div className="user-details">
          <div className="user-name">Bienvenido, {user?.name}</div>
          <div className="user-role">
            {getUserRoleLabel()}
          </div>
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          <i className="pi pi-chevron-down"></i>
        </div>
      </div>

      {isOpen && (
        <div className="user-profile-dropdown">
          <div className="dropdown-item" onClick={handleProfileClick}>
            <i className="pi pi-user"></i>
            <span>Perfil</span>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item logout" onClick={handleLogoutClick}>
            <i className="pi pi-sign-out"></i>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
