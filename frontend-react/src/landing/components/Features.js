import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Metodología Personalizada',
      category: 'Educación',
      description: 'Adaptamos nuestro enfoque educativo a las necesidades únicas de cada niño para maximizar su potencial de aprendizaje.',
      benefits: [
        'Evaluación individual continua',
        'Planes de estudio adaptados',
        'Seguimiento personalizado',
        'Atención especializada'
      ]
    },
    {
      icon: '👥',
      title: 'Grupos Reducidos',
      category: 'Ambiente',
      description: 'Máximo 12 niños por grupo para garantizar atención personalizada y un ambiente de aprendizaje óptimo.',
      benefits: [
        'Mayor interacción maestro-alumno',
        'Ambiente más acogedor',
        'Mejor control del progreso',
        'Relaciones más cercanas'
      ]
    },
    {
      icon: '💚',
      title: 'Ambiente Seguro',
      category: 'Seguridad',
      description: 'Instalaciones diseñadas especialmente para niños con los más altos estándares de seguridad y limpieza.',
      benefits: [
        'Instalaciones certificadas',
        'Protocolos de seguridad',
        'Higiene especializada',
        'Monitoreo constante'
      ]
    }
  ];

  return (
    <section className="features">
      <div className="features-container">
        <div className="features-header">
          <div className="features-badge">⭐ Características Destacadas</div>
          <h2>¿Por Qué Elegir <span className="highlight">"Nombre"</span>?</h2>
          <p>
            Ofrecemos una experiencia educativa integral que combina metodologías innovadoras 
            con un ambiente cálido y seguro, diseñado especialmente para el desarrollo óptimo de cada niño.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">
                  <h3>{feature.title}</h3>
                  <div className="feature-category">{feature.category}</div>
                </div>
              </div>
              <p>{feature.description}</p>
              <ul className="feature-benefits">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex}>
                    <div className="benefit-check">✓</div>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="feature-accent"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
