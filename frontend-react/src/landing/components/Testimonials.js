import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "EduKid transformó completamente la experiencia educativa de mi hija. Ver su crecimiento diario y su emoción por aprender cada mañana no tiene precio. ¡Es el mejor regalo que pudimos darle!",
      author: "María González",
      role: "Madre de Sofía (4 años)",
      avatar: "MG",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 2,
      text: "La metodología que utilizan es excepcional. Mi hijo desarrolló habilidades sociales y cognitivas de manera sorprendente. Los maestros no solo enseñan, son verdaderos guías en su desarrollo.",
      author: "Carlos Rodríguez",
      role: "Padre de Diego (3 años)",
      avatar: "CR",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 3,
      text: "Estamos completamente enamorados de EduKid. Las instalaciones son de otro nivel, el programa es integral y lo más importante: nuestro hijo despierta emocionado por ir cada día.",
      author: "Ana Martínez",
      role: "Madre de Lucas (5 años)",
      avatar: "AM",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 4,
      text: "La atención personalizada y el seguimiento individual han sido increíbles. Mi hija no solo aprende, sino que desarrolla confianza y autonomía. ¡Recomiendo EduKid sin dudarlo!",
      author: "Roberto Silva",
      role: "Padre de Isabella (4 años)",
      avatar: "RS",
      rating: 5,
      image: "/api/placeholder/80/80"
    },
    {
      id: 5,
      text: "Como educadora, puedo decir que EduKid supera mis expectativas. La metodología innovadora y el ambiente acogedor crean la combinación perfecta para el desarrollo integral.",
      author: "Lucía Herrera",
      role: "Madre de Mateo (3 años)",
      avatar: "LH",
      rating: 5,
      image: "/api/placeholder/80/80"
    }
  ];

  const stats = [
    { number: "500+", label: "Familias Satisfechas", icon: "👨‍👩‍👧‍👦" },
    { number: "98%", label: "Satisfacción General", icon: "⭐" },
    { number: "15+", label: "Años de Experiencia", icon: "🎓" },
    { number: "25+", label: "Programas Especializados", icon: "📚" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <div className="header-badge">✨ Testimonios Reales</div>
          <h2>
            Lo Que Dicen Nuestras <span className="highlight">Familias</span>
          </h2>
          <p>
            La confianza de los padres es nuestro mayor logro. Conoce las experiencias 
            auténticas de familias que han elegido EduKid para transformar el futuro de sus pequeños.
          </p>
        </div>

        <div className="testimonials-carousel">
          <button className="carousel-btn prev" onClick={prevSlide}>
            <span>‹</span>
          </button>
          
          <div className="testimonial-main">
            <div className="testimonial-featured">
              <div className="quote-decoration">"</div>
              <div className="rating">
                {[...Array(testimonials[currentSlide].rating)].map((_, index) => (
                  <span key={index} className="star">★</span>
                ))}
              </div>
              <blockquote className="testimonial-text">
                {testimonials[currentSlide].text}
              </blockquote>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src={testimonials[currentSlide].image} alt={testimonials[currentSlide].author} />
                  <div className="avatar-fallback">{testimonials[currentSlide].avatar}</div>
                </div>
                <div className="author-info">
                  <h4>{testimonials[currentSlide].author}</h4>
                  <p>{testimonials[currentSlide].role}</p>
                </div>
                <div className="verified-badge">
                  <span>✓</span>
                  <small>Verificado</small>
                </div>
              </div>
            </div>
          </div>

          <button className="carousel-btn next" onClick={nextSlide}>
            <span>›</span>
          </button>
        </div>

        <div className="carousel-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="testimonials-grid">
          {testimonials.filter((_, index) => index !== currentSlide).slice(0, 3).map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <span key={index} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src={testimonial.image} alt={testimonial.author} />
                  <div className="avatar-fallback">{testimonial.avatar}</div>
                </div>
                <div className="author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-showcase">
          <div className="stats-header">
            <h3>Números que Nos Enorgullecen</h3>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h3>¿Listo para Ser Parte de Nuestra Familia?</h3>
            <p>Únete a cientos de familias que ya confían en nosotros</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">Agendar Visita</button>
              <button className="cta-btn secondary">Ver Programas</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
