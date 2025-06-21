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
      title: "Clase de Deportes",
      description: "Cada día en EduKid es una celebración llena de actividades deportivas divertidas",
      bgColor: "#FFB347"
    },
    {
      id: 2,
      icon: musicIcon,
      title: "Clase de Música",
      description: "Actividades musicales creativas y divertidas para los niños más pequeños",
      bgColor: "#4ECDC4"
    },
    {
      id: 3,
      icon: drawingIcon,
      title: "Clase de Dibujo",
      description: "Proyectos de arte y manualidades divertidos para que los niños trabajen juntos",
      bgColor: "#E74C3C"
    }
  ];

  return (
    <section className="programs">
      <div className="programs-container">
        <div className="programs-header">
          <h2>Nuestros Programas</h2>
          <p>Nuestro jardín de infantes multi-sensorial para niños de 2-5 años con un currículum enfocado en el desarrollo infantil.</p>
        </div>
        <div className="programs-grid">
          {programs.map((program) => (
            <div key={program.id} className="program-card" style={{backgroundColor: program.bgColor}}>
              <div className="program-icon">
                <img src={program.icon} alt={program.title} />
              </div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <button className="program-btn">Ver Detalles</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
