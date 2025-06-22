import React, { useState, useEffect, useRef } from 'react';
import './Stats.css';

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const statsRef = useRef(null);

  const stats = [
    { 
      number: 50,
      suffix: "+",
      label: "Familias Satisfechas", 
      icon: "👨‍👩‍👧‍👦",
      description: "Confianza en nuestro cuidado"
    },
    { 
      number: 98,
      suffix: "%", 
      label: "Satisfacción General", 
      icon: "⭐",
      description: "Calidad comprobada"
    },
    { 
      number: 5,
      suffix: "+", 
      label: "Años de Experiencia", 
      icon: "🎓",
      description: "Trayectoria sólida"
    },
    { 
      number: 5,
      suffix: "+", 
      label: "Programas Especializados", 
      icon: "📚",
      description: "Educación integral"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat, index) => {
        animateNumber(index, stat.number);
      });
    }
  }, [isVisible]);

  const animateNumber = (index, targetNumber) => {
    const duration = 3000;
    const steps = 60;
    const increment = targetNumber / steps;
    let currentNumber = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      currentNumber += increment;
      stepCount++;

      if (stepCount >= steps || currentNumber >= targetNumber) {
        currentNumber = targetNumber;
        clearInterval(timer);
      }

      setAnimatedNumbers(prev => ({
        ...prev,
        [index]: Math.floor(currentNumber)
      }));
    }, duration / steps);
  };

  return (
    <section className="stats" id="estadisticas" ref={statsRef}>
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
                <h3 className="stat-number">
                  {animatedNumbers[index] || 0}{stat.suffix}
                </h3>
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