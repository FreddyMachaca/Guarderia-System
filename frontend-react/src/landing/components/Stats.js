import React from 'react';
import './Stats.css';

const Stats = () => {
  const stats = [
    { 
      number: "50+", 
      label: "Familias Satisfechas", 
      icon: "👨‍👩‍👧‍👦",
      description: "Confianza en nuestro cuidado"
    },
    { 
      number: "98%", 
      label: "Satisfacción General", 
      icon: "⭐",
      description: "Calidad comprobada"
    },
    { 
      number: "5+", 
      label: "Años de Experiencia", 
      icon: "🎓",
      description: "Trayectoria sólida"
    },
    { 
      number: "5+", 
      label: "Programas Especializados", 
      icon: "📚",
      description: "Educación integral"
    }
  ];

  return (
    <section className="stats" id="estadisticas">
      <div className="stats-container">
        <div className="stats-header">
          <div className="stats-badge">📊 Nuestros Logros</div>
          <h2>Números que Nos <span className="highlight">Motivan</span></h2>
          <p>
            Cada número representa familias transformadas, sueños cumplidos y el compromiso 
            inquebrantable con la excelencia educativa que nos define día a día.
          </p>
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" data-index={index}>
              <div className="stat-visual">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-progress">
                  <div className="progress-bar"></div>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stat.number}</h3>
                <h4 className="stat-label">{stat.label}</h4>
                <p className="stat-description">{stat.description}</p>
              </div>
              <div className="stat-decoration">
                <div className="decoration-dot"></div>
                <div className="decoration-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;