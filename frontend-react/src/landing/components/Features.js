import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Metodología Personalizada',
      description: 'Adaptamos nuestro enfoque educativo a las necesidades únicas de cada niño para maximizar su potencial de aprendizaje.'
    },
    {
      icon: '👥',
      title: 'Grupos Reducidos',
      description: 'Máximo 12 niños por grupo para garantizar atención personalizada y un ambiente de aprendizaje óptimo.'
    },
    {
      icon: '🏆',
      title: 'Educadores Certificados',
      description: 'Nuestro equipo está formado por profesionales especializados en educación infantil y desarrollo cognitivo.'
    },
    {
      icon: '🌍',
      title: 'Programa Bilingüe',
      description: 'Inmersión temprana en inglés y español para desarrollar habilidades lingüísticas desde pequeños.'
    },
    {
      icon: '🔬',
      title: 'Aprendizaje STEAM',
      description: 'Ciencia, Tecnología, Ingeniería, Arte y Matemáticas integradas de manera divertida y práctica.'
    },
    {
      icon: '💚',
      title: 'Ambiente Seguro',
      description: 'Instalaciones diseñadas especialmente para niños con los más altos estándares de seguridad y limpieza.'
    }
  ];

  return (
    <section className="features">
      <div className="features-container">
        <div className="features-header">
          <h2>¿Por Qué Elegir EduKid?</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
