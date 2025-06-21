import React, { useState } from 'react';
import './Footer.css';
import logo from '../../assets/icons/logo.svg';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Suscripción newsletter:', email);
    setEmail('');
  };

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
              <a href="#" className="social-link" aria-label="Facebook">f</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="YouTube">▶</a>
              <a href="#" className="social-link" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Navegación</h3>
            <ul className="footer-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#sobre-nosotros">Acerca de Nosotros</a></li>
              <li><a href="#programas">Nuestros Programas</a></li>
              <li><a href="#contacto">Contacto</a></li>
              <li><a href="#admisiones">Admisiones</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Programas</h3>
            <ul className="footer-links">
              <li><a href="#">Actividades Deportivas</a></li>
              <li><a href="#">Educación Musical</a></li>
              <li><a href="#">Arte y Creatividad</a></li>
              <li><a href="#">Inglés Inmersivo</a></li>
              <li><a href="#">Estimulación Temprana</a></li>
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
                <div className="contact-icon">✉️</div>
                info@gmail.com
              </li>
              <li>
                <div className="contact-icon">🕒</div>
                Lun - Vie: 7:00 AM - 6:00 PM
              </li>
            </ul>

            <div className="newsletter">
              <h4>Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">Suscribir</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Cegepa SRL. Todos los derechos reservados.</p>
          <div className="footer-bottom-links">
            <a href="#">Política de Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Aviso Legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
