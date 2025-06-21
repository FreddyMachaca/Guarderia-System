import React from 'react';
import './Landing.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Programs from './components/Programs';

const Landing = () => {
  return (
    <div className="landing">
      <Header />
      <Hero />
      <Programs />
    </div>
  );
};

export default Landing;
