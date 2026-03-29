import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Slide1 from './pages/slides/Slide1';
import Slide2 from './pages/slides/Slide2';
import Slide3 from './pages/slides/Slide3';
import Slide4 from './pages/slides/Slide4';
import Slide5 from './pages/slides/Slide5';
import Slide6 from './pages/slides/Slide6';
import Slide7 from './pages/slides/Slide7';
import Slide8 from './pages/slides/Slide8';
import Slide9 from './pages/slides/Slide9';
import Slide10 from './pages/slides/Slide10';

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10];
const TOTAL = SLIDES.length;

function getInitialSlide(): number {
  const match = window.location.pathname.match(/slide(\d+)/);
  if (match) {
    const n = parseInt(match[1]);
    if (n >= 1 && n <= TOTAL) return n;
  }
  return 1;
}

function Presentation() {
  const base = import.meta.env.BASE_URL;
  const [current, setCurrent] = useState(getInitialSlide);
  const SlideComp = SLIDES[current - 1];

  const go = useCallback((n: number) => {
    if (n >= 1 && n <= TOTAL) setCurrent(n);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') go(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(current - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, go]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <SlideComp base={base} />
      <nav className="slide-nav">
        <button
          onClick={() => go(current - 1)}
          disabled={current === 1}
          style={{ cursor: current === 1 ? 'not-allowed' : 'pointer' }}
        >&#8592;</button>
        <div className="dot-row">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className={`dot${current === i + 1 ? ' active' : ''}`}
              onClick={() => go(i + 1)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
        <span className="counter">{current} / {TOTAL}</span>
        <button
          onClick={() => go(current + 1)}
          disabled={current === TOTAL}
          style={{ cursor: current === TOTAL ? 'not-allowed' : 'pointer' }}
        >&#8594;</button>
      </nav>
    </div>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="*" element={<Presentation />} />
      </Routes>
    </BrowserRouter>
  );
}
