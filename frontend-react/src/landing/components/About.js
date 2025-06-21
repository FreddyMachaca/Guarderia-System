import React from 'react';
import './About.css';
import playGroup from '../../assets/images/play-group.png';

const About = () => {
  const features = [
    "Metodología Montessori certificada",
    "Instalaciones seguras y modernas",
    "Educadores altamente calificados",
    "Grupos reducidos (máx. 12 niños)",
    "Programa bilingüe español-inglés",
    "Seguimiento personalizado del desarrollo"
  ];

  return (
    <section className="about" id="sobre-nosotros">
      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <div className="about-badge">🌟 Excelencia Educativa</div>
            <h2 className="about-title">
              Creamos Experiencias de Aprendizaje Extraordinarias
            </h2>
            <p className="about-description">
              En EduKid, cada día es una aventura de descubrimiento. Nuestro enfoque 
              pedagógico innovador combina la tradición educativa con metodologías modernas, 
              creando un ambiente donde cada niño puede brillar y desarrollar su máximo potencial.
            </p>
            <ul className="about-features">
              {features.map((feature, index) => (
                <li key={index}>
                  <div className="feature-icon">✓</div>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="about-btn">Conoce Más Sobre Nosotros</button>
          </div>
          <div className="about-visual">
            <div className="visual-decoration">🎓</div>
            <img src={playGroup} alt="Niños aprendiendo en EduKid" className="about-image" />
            <div className="experience-badge">
              <span className="experience-number">15+</span>
              <span className="experience-text">Años formando pequeños genios</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
