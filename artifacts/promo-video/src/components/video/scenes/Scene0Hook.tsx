import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function Scene0Hook() {
  useEffect(() => {
    setTimeout(() => window.playSfx?.(), 300);
    setTimeout(() => window.speakText?.("Start earning real money today"), 100);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <h1 
          className="text-[3.5rem] font-bold text-center text-white leading-tight px-4 uppercase tracking-wider"
          style={{ textShadow: "0 0 20px #00d4ff, 0 0 40px #7c3aed" }}
        >
          Earn<br/>Real Money
        </h1>
        <div className="h-1 w-32 bg-[#00d4ff] mt-6 rounded-full shadow-[0_0_10px_#00d4ff]" />
      </motion.div>
    </motion.div>
  );
}
