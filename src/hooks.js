import { useState, useEffect } from "react";

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: true, isTablet: false, isDesktop: false, width: 375 });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, width: w });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return bp;
}

export default useBreakpoint;
