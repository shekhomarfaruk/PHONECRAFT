import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Slide1 from './pages/slides/Slide1';
import Slide2 from './pages/slides/Slide2';
import Slide3 from './pages/slides/Slide3';
import Slide4 from './pages/slides/Slide4';
import Slide5 from './pages/slides/Slide5';
import Slide6 from './pages/slides/Slide6';
import Slide7 from './pages/slides/Slide7';
import Slide8 from './pages/slides/Slide8';

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8];
const TOTAL = SLIDES.length;

function AllSlides() {
  const base = import.meta.env.BASE_URL;
  return (
    <div style={{ background: '#000', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {SLIDES.map((SlideComp, i) => (
        <div key={i} style={{ width: '1920px', height: '1080px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <SlideComp base={base} />
        </div>
      ))}
    </div>
  );
}

function SlideViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const base = import.meta.env.BASE_URL;

  const match = location.pathname.match(/\/slide(\d+)/);
  const current = match ? Math.min(Math.max(parseInt(match[1]), 1), TOTAL) : 1;
  const SlideComp = SLIDES[current - 1];

  const go = useCallback((n: number) => {
    if (n >= 1 && n <= TOTAL) navigate(`slide${n}`);
  }, [navigate]);

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
      <div className="w-screen h-screen overflow-hidden relative">
        <SlideComp base={base} />
      </div>
      <nav className="slide-nav">
        <button onClick={() => go(current - 1)} disabled={current === 1}>&#8592;</button>
        <div className="dot-row">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={i} className={`dot${current === i + 1 ? ' active' : ''}`} onClick={() => go(i + 1)} style={{ cursor: 'pointer' }} />
          ))}
        </div>
        <span className="counter">{current} / {TOTAL}</span>
        <button onClick={() => go(current + 1)} disabled={current === TOTAL}>&#8594;</button>
      </nav>
    </div>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="slide1" replace />} />
        <Route path="allslides" element={<AllSlides />} />
        {Array.from({ length: TOTAL }, (_, i) => (
          <Route key={i} path={`slide${i + 1}`} element={<SlideViewer />} />
        ))}
        <Route path="*" element={<Navigate to="slide1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
