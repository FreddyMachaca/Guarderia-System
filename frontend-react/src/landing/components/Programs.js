import React from 'react';
import './Programs.css';
import sportIcon from '../../assets/icons/sport-class.svg';
import musicIcon from '../../assets/icons/music-class.svg';
import drawingIcon from '../../assets/icons/drawing-class.svg';

const Programs = () => {
  const programs = [
    {
      id: 1,
      icon: sportIcon,
      title: "Actividades Deportivas",
      description: "Desarrollo físico y coordinación a través de deportes adaptados para cada edad",
      features: ["Natación infantil", "Gimnasia rítmica", "Fútbol recreativo", "Yoga para niños"],
      className: "sports"
    },
    {
      id: 2,
      icon: musicIcon,
      title: "Educación Musical",
      description: "Estimulación auditiva y creatividad musical para el desarrollo cognitivo integral",
      features: ["Piano y teclado", "Coro infantil", "Instrumentos", "Musicoterapia"],
      className: "music"
    },
    {
      id: 3,
      icon: drawingIcon,
      title: "Arte y Creatividad",
      description: "Expresión artística y desarrollo de habilidades motoras finas a través del arte",
      features: ["Pintura y dibujo", "Escultura", "Manualidades", "Arte digital"],
      className: "drawing"
    }
  ];

  const stats = [
    { number: "500+", label: "Estudiantes Activos" },
    { number: "25+", label: "Programas Especializados" },
    { number: "15+", label: "Años de Experiencia" },
    { number: "98%", label: "Satisfacción Familiar" }
  ];

  return (
    <section className="programs" id="programas">
      <div className="programs-container">
        <div className="programs-header">
          <h2>Nuestros Programas Especializados</h2>
          <p>
            Desarrollamos el potencial único de cada niño a través de programas educativos 
            innovadores diseñados por expertos en desarrollo infantil. Cada actividad está 
            cuidadosamente planificada para estimular el crecimiento integral.
          </p>
        </div>
        <div className="programs-grid">
          {programs.map((program) => (
            <div key={program.id} className={`program-card ${program.className}`}>
              <div className="program-icon">
                <img src={program.icon} alt={program.title} />
              </div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <ul className="program-features">
                {program.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className="program-btn">Explorar Programa</button>
            </div>
          ))}
        </div>
        
        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
