import React from 'react';
import Slide1 from './slides/Slide1';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';
import Slide4 from './slides/Slide4';
import Slide5 from './slides/Slide5';
import Slide6 from './slides/Slide6';
import Slide7 from './slides/Slide7';
import Slide8 from './slides/Slide8';
import Slide9 from './slides/Slide9';
import Slide10 from './slides/Slide10';

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10];

export default function AllSlides() {
  const base = import.meta.env.BASE_URL;
  return (
    <div style={{ background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {SLIDES.map((SlideComp, i) => (
        <div
          key={i}
          style={{
            width: '1920px',
            height: '1080px',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <SlideComp base={base} />
        </div>
      ))}
    </div>
  );
}
