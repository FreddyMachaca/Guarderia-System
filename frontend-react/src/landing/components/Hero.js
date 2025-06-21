import React, { useState, useEffect } from 'react';
import './Hero.css';
import heroImage from '../../assets/images/hero-image.png';

const Hero = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const rotatingTexts = [
    "Mejor Currículum",
    "Más Innovador",
    "Más Divertido",
    "Más Seguro"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  return (
    <section className="hero" id="inicio">
      <div className="hero-background">
        <div className="floating-elements">
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
          <div className="floating-square"></div>
          <div className="floating-triangle"></div>
        </div>
      </div>
      
      <div className="hero-container">
        <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
          
          <h1 className="hero-title">
            Nuestro Programa <span className="rotating-text">
              <span className={`text-item ${currentTextIndex === 0 ? 'active' : ''}`}>
                {rotatingTexts[0]}
              </span>
              <span className={`text-item ${currentTextIndex === 1 ? 'active' : ''}`}>
                {rotatingTexts[1]}
              </span>
              <span className={`text-item ${currentTextIndex === 2 ? 'active' : ''}`}>
                {rotatingTexts[2]}
              </span>
              <span className={`text-item ${currentTextIndex === 3 ? 'active' : ''}`}>
                {rotatingTexts[3]}
              </span>
            </span><br />
            <span className="subtitle">de Educación Infantil</span>
          </h1>
          
          <p className="hero-description">
            Desarrollamos el potencial único de cada niño con metodologías innovadoras, 
            ambiente seguro y educadores especializados. Tu hijo merece el mejor comienzo 
            para su futuro brillante.
          </p>
          
          <div className="hero-buttons">
            <button className="hero-btn primary">
              <span className="btn-text">Inscríbete Ahora</span>
              <span className="btn-icon">→</span>
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
        
        <div className={`hero-image ${isVisible ? 'animate-in' : ''}`}>
          <div className="image-frame">
            <img src={heroImage} alt="Niños felices en EduKid" />
            <div className="image-overlay">
              <div className="overlay-badge">
                <span className="badge-icon">🎨</span>
                <span>Creatividad</span>
              </div>
              <div className="overlay-badge bottom">
                <span className="badge-icon">🧠</span>
                <span>Desarrollo</span>
              </div>
            </div>
          </div>
          
          <div className="floating-stats">
            <div className="floating-stat">
              <div className="stat-circle">
                <span className="stat-emoji">😊</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">100%</span>
                <span className="stat-desc">Felicidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
