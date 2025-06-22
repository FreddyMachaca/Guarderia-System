import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './landing/Landing';
import Portal from './system/Portal';
import AppSystem from './system/AppSystem';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/system/*" element={<AppSystem />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
