import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/icons/logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="Guardería" />
          <span>Nombre</span>
        </div>
        <nav className="nav">
          <a href="#inicio" onClick={(e) => handleNavClick(e, 'inicio')}>Inicio</a>
          <a href="#sobre-nosotros" onClick={(e) => handleNavClick(e, 'sobre-nosotros')}>Acerca</a>
          <a href="#programas" onClick={(e) => handleNavClick(e, 'programas')}>Programas</a>
          <a href="#testimonios" onClick={(e) => handleNavClick(e, 'testimonios')}>Testimonios</a>
          <a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a>
        </nav>
        <a 
          href="#contacto" 
          className="apply-btn"
          onClick={(e) => handleNavClick(e, 'contacto')}
        >
          Inscríbete
        </a>
      </div>
    </header>
  );
};

export default Header;
