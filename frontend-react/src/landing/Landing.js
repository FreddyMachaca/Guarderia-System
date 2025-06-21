import React from 'react';
import './Landing.css';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Programs from './components/Programs';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

const Landing = () => {
  return (
    <div className="landing">
      <Header />
      <Hero />
      <About />
      <Features />
      <Programs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Landing;
