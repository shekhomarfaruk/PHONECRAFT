import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { PhoneFrame } from '../PhoneFrame';

export function Scene7Support() {
  useEffect(() => {
    setTimeout(() => window.playSfx?.(), 300);
    setTimeout(() => window.speakText?.("24-7 live support always available"), 100);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-start pt-16 z-20"
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <PhoneFrame src={`${import.meta.env.BASE_URL}screen-support.jpg`} alt="Live Support" />
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
        className="absolute bottom-20 left-0 w-full px-6"
      >
        <div className="bg-[#0a0a1a]/90 backdrop-blur-md border border-[#00d4ff]/30 p-6 rounded-2xl text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h2 className="text-3xl font-bold text-[#00d4ff] mb-2 uppercase tracking-wide" style={{ textShadow: "0 0 10px #00d4ff" }}>
            24/7 Live Support
          </h2>
          <p className="text-white text-lg font-medium">Always here to help</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
