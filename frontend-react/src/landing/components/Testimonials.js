import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    {
      id: 1,
      text: "Mi hija Sofía ha florecido de manera increíble desde que está aquí. La metodología personalizada y el cariño del equipo han transformado su manera de aprender y relacionarse.",
      author: "María González",
      role: "Madre de Sofía",
      age: "4 años",
      avatar: "MG",
      rating: 5,
      location: "La Paz",
      timeEnrolled: "2 años"
    },
    {
      id: 2,
      text: "Como padre, ver el desarrollo emocional y cognitivo de Diego ha sido extraordinario. Los maestros no solo educan, realmente se preocupan por cada niño como si fuera propio.",
      author: "Carlos Rodríguez",
      role: "Padre de Diego",
      age: "3 años",
      avatar: "CR",
      rating: 5,
      location: "Cochabamba",
      timeEnrolled: "1.5 años"
    },
    {
      id: 3,
      text: "Lucas llegó tímido y reservado, ahora es un niño seguro de sí mismo, creativo y con ganas de explorar el mundo. El ambiente cálido y las metodologías innovadoras han sido clave.",
      author: "Ana Martínez",
      role: "Madre de Lucas",
      age: "5 años",
      avatar: "AM",
      rating: 5,
      location: "Santa Cruz",
      timeEnrolled: "3 años"
    },
    {
      id: 4,
      text: "La atención personalizada es incomparable. Isabella no solo ha desarrollado habilidades académicas, sino también valores fundamentales que la acompañarán toda la vida.",
      author: "Roberto Silva",
      role: "Padre de Isabella",
      age: "4 años",
      avatar: "RS",
      rating: 5,
      location: "Tarija",
      timeEnrolled: "2.5 años"
    },
    {
      id: 5,
      text: "Como educadora, reconozco la calidad excepcional del programa. Mateo ha superado todas nuestras expectativas y cada día nos sorprende con su crecimiento integral.",
      author: "Lucía Herrera",
      role: "Madre de Mateo",
      age: "3 años",
      avatar: "LH",
      rating: 5,
      location: "Oruro",
      timeEnrolled: "1 año"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        nextSlide();
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isAnimating]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  return (
    <section className="testimonials" id="testimonios">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <div className="testimonials-badge">💬 Testimonios</div>
          <h2>
            Historias que <span className="highlight">Inspiran</span>
          </h2>
          <p>
            Cada testimonio es una historia de transformación, crecimiento y confianza. 
            Descubre por qué las familias eligen nuestro centro como el hogar educativo de sus pequeños.
          </p>
        </div>

        <div className="testimonials-main">
          <div className="testimonial-featured">
            <div className={`testimonial-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              <div className="rating-section">
                <div className="stars">
                  {[...Array(testimonials[currentSlide].rating)].map((_, index) => (
                    <span key={index} className="star">⭐</span>
                  ))}
                </div>
                <span className="rating-text">Experiencia Excepcional</span>
              </div>

              <blockquote className="testimonial-text">
                {testimonials[currentSlide].text}
              </blockquote>

              <div className="testimonial-author">
                <div className="author-profile">
                  <div className="author-avatar">
                    <div className="avatar-circle">
                      <span>{testimonials[currentSlide].avatar}</span>
                    </div>
                    <div className="avatar-ring"></div>
                  </div>
                  <div className="author-details">
                    <h4>{testimonials[currentSlide].author}</h4>
                    <p className="author-role">{testimonials[currentSlide].role}</p>
                    <div className="author-meta">
                      <span className="child-age">{testimonials[currentSlide].age}</span>
                      <span className="separator">•</span>
                      <span className="location">{testimonials[currentSlide].location}</span>
                    </div>
                  </div>
                </div>
                <div className="trust-indicators">
                  <div className="enrollment-time">
                    <div className="time-icon">⏰</div>
                    <span>{testimonials[currentSlide].timeEnrolled} con nosotros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial-navigation">
            <button className="nav-btn prev" onClick={prevSlide} disabled={isAnimating}>
              <span>‹</span>
            </button>
            <button className="nav-btn next" onClick={nextSlide} disabled={isAnimating}>
              <span>›</span>
            </button>
          </div>
        </div>

        <div className="testimonials-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
            >
              <span className="indicator-dot"></span>
            </button>
          ))}
        </div>



        <div className="testimonials-cta">
          <div className="cta-content">
            <div className="cta-icon">🌈</div>
            <h3>¿Tu Historia Será la Próxima?</h3>
            <p>Únete a nuestra familia y crea recuerdos inolvidables para tu pequeño</p>
            <div className="cta-actions">
              <a 
                className="cta-btn secondary" 
                href="https://wa.me/11111111" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span>Programa una Visita</span>
                <div className="btn-calendar">📅</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
