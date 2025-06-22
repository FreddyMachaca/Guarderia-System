import React from 'react';
import './Footer.css';
import logo from '../../assets/icons/logo.svg';
import facebookIcon from '../../assets/icons/facebook-icon.svg';
import whatsappIcon from '../../assets/icons/whatsapp-icon.svg';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="Logo" />
              <span>Nombre</span>
            </div>
            <p className="footer-description">
              Formamos pequeños genios con amor, dedicación y metodologías innovadoras. 
              Cada día es una nueva oportunidad para descubrir el potencial único de tu hijo.
            </p>
            <div className="social-links">
              <a href="https://facebook.com/guarderia" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a href="https://wa.me/59111111111" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
                <img src={whatsappIcon} alt="WhatsApp" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Navegación</h3>
            <ul className="footer-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#sobre-nosotros">Acerca de Nosotros</a></li>
              <li><a href="#programas">Nuestros Programas</a></li>
              <li><a href="#testimonios">Testimonios</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Programas</h3>
            <ul className="footer-links">
              <li><a href="#deportes">Actividades Deportivas</a></li>
              <li><a href="#musica">Educación Musical</a></li>
              <li><a href="#arte">Arte y Creatividad</a></li>
              <li><a href="#ingles">Inglés Inmersivo</a></li>
              <li><a href="#estimulacion">Estimulación Temprana</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contacto</h3>
            <ul className="contact-info">
              <li>
                <div className="contact-icon">📍</div>
                Av. Educación 123, Centro
              </li>
              <li>
                <div className="contact-icon">📞</div>
                +591 1234-5678
              </li>
              <li>
                <div className="contact-icon">🕒</div>
                Lun - Vie: 7:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Cegepa SRL. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
