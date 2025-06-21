import React, { useState } from 'react';
import './Contact.css';
import whatsappIcon from '../../assets/icons/whatsapp-icon.svg';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      childName: '',
      childAge: '',
      message: ''
    });
  };

  return (
    <section className="contact" id="contacto">
      <div className="contact-container">
        <div className="contact-header">
          <div className="contact-badge">📋 Solicitud de Información</div>
          <h2>¿Listo para comenzar una gran <span className="highlight">aventura educativa</span>?</h2>
          <p>
            Completa el formulario y uno de nuestros asesores educativos te 
            contactará para brindarte toda la información que necesitas.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>Solicitar Información</h3>
              <div className="form-group">
                <label htmlFor="name">Nombre del Padre/Madre/Tutor</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+591 XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="childName">Nombre del Niño/a</label>
                  <input
                    type="text"
                    id="childName"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    required
                    placeholder="Nombre de tu hijo/a"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="childAge">Edad</label>
                  <input
                    type="text"
                    id="childAge"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleChange}
                    required
                    placeholder="Edad en años"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensaje o Consulta</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Cuéntanos qué te gustaría saber sobre nuestros servicios"
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Solicitar Información
              </button>
            </form>
          </div>

          <div className="contact-info">
            <div className="info-block">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h4>Visítanos</h4>
                <p>Av. Educación 123, Centro</p>
              </div>
            </div>

            <div className="info-block">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <h4>Llámanos</h4>
                <p>+591 1234-5678</p>
              </div>
            </div>

            <div className="info-block">
              <div className="info-icon">🕒</div>
              <div className="info-content">
                <h4>Horario de Atención</h4>
                <p>Lunes a Viernes: 7:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="cta-block">
              <h4>CONTÁCTANOS EN WHATSAPP</h4>
              <p>Obtén respuesta inmediata a todas tus consultas</p>
              <a 
                href="https://wa.me/11111111" 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-icon" />
                Escribir en WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;