import React from 'react';
import './About.css';
import playGroup from '../../assets/images/play-group.png';

const About = () => {
  return (
    <section className="about" id="sobre-nosotros">
      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="about-title">
              Creamos Experiencias de Aprendizaje <span className="highlight">Extraordinarias</span>
            </h2>
            <p className="about-description">
              En "Nombre", cada día es una aventura de descubrimiento. Nuestro enfoque 
              pedagógico innovador combina la tradición educativa con metodologías modernas, 
              creando un ambiente donde cada niño puede brillar y desarrollar su máximo potencial.
            </p>
            <div className="about-actions">
              <a href="#contacto" className="about-btn">Conoce Más Sobre Nosotros</a>
            </div>
          </div>
          <div className="about-visual">
            <div className="image-container">
              <img src={playGroup} alt="Niños aprendiendo" className="about-image" />
              <div className="floating-badge top-left">
                <span className="badge-icon">🎓</span>
                <span className="badge-text">Educación de Calidad</span>
              </div>
              <div className="floating-badge bottom-right">
                <span className="badge-icon">💚</span>
                <span className="badge-text">Ambiente Seguro</span>
              </div>
            </div>
            <div className="decorative-element"></div>
            <div className="decorative-element"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
