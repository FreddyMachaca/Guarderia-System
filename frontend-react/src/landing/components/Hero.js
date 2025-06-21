import React from 'react';
import './Hero.css';
import heroImage from '../../assets/images/hero-image.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">Programa de Jardín de Infantes</div>
          <h1 className="hero-title">
            El Mejor Currículum de <br />
            Educación Infantil
          </h1>
          <p className="hero-description">
            Admisión Abierta del 20-30 de Abril
          </p>
          <button className="hero-btn">Inscríbete Ahora</button>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Niños en guardería" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
