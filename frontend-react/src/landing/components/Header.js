import React from 'react';
import './Header.css';
import logo from '../../assets/icons/logo.svg';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="Guardería" />
          <span>Nombre</span>
        </div>
        <nav className="nav">
          <a href="#inicio">Inicio</a>
          <a href="#sobre-nosotros">Acerca</a>
          <a href="#programas">Programas</a>
          <a href="#noticias">Noticias</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <button className="apply-btn">Inscríbete</button>
      </div>
    </header>
  );
};

export default Header;
