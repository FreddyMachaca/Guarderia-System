import React, { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/icons/logo.svg';
import menuIcon from '../../assets/icons/menu-icon.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Guardería" />
            <span>Guarderia</span>
          </div>
          <nav className="nav">
            <a href="#inicio" onClick={(e) => handleNavClick(e, 'inicio')}>Inicio</a>
            <a href="#sobre-nosotros" onClick={(e) => handleNavClick(e, 'sobre-nosotros')}>Acerca</a>
            <a href="#programas" onClick={(e) => handleNavClick(e, 'programas')}>Programas</a>
            <a href="#testimonios" onClick={(e) => handleNavClick(e, 'testimonios')}>Testimonios</a>
            <a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a>
          </nav>
          <div className="header-buttons">
            <a 
              href="/portal" 
              className="portal-btn"
            >
              Ingresar al Portal
            </a>
            <a 
              href="#contacto" 
              className="apply-btn"
              onClick={(e) => handleNavClick(e, 'contacto')}
            >
              Inscríbete
            </a>
          </div>
          <div className="mobile-menu" onClick={toggleMenu}>
            <img src={menuIcon} alt="Menu" />
          </div>
        </div>
      </header>

      <div 
        className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />
      
      <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <div className="logo">
            <img src={logo} alt="Guardería" />
            <span>Guarderia</span>
          </div>
          <button className="mobile-nav-close" onClick={closeMenu}>
            ×
          </button>
        </div>
        
        <div className="mobile-nav-links">
          <a href="#inicio" onClick={(e) => handleNavClick(e, 'inicio')}>Inicio</a>
          <a href="#sobre-nosotros" onClick={(e) => handleNavClick(e, 'sobre-nosotros')}>Acerca</a>
          <a href="#programas" onClick={(e) => handleNavClick(e, 'programas')}>Programas</a>
          <a href="#testimonios" onClick={(e) => handleNavClick(e, 'testimonios')}>Testimonios</a>
          <a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a>
        </div>
        
        <div className="mobile-nav-buttons">
          <a 
            href="/portal" 
            className="portal-btn"
          >
            Ingresar al Portal
          </a>
          <a 
            href="#contacto" 
            className="apply-btn"
            onClick={(e) => handleNavClick(e, 'contacto')}
          >
            Inscríbete
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
