import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function Scene1Logo() {
  useEffect(() => {
    setTimeout(() => window.playSfx?.(), 300);
    setTimeout(() => window.speakText?.("PhoneCraft — virtual phone manufacturing"), 100);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img 
        src={`${import.meta.env.BASE_URL}logo.png`} 
        alt="PhoneCraft" 
        className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.8)]"
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-8 text-center px-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">PhoneCraft</h2>
        <p className="text-[#00d4ff] text-lg font-medium tracking-wide">
          Virtual Phone Manufacturing Platform
        </p>
      </motion.div>
      
      {/* Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200
          }}
          transition={{
            duration: 1.5,
            delay: 0.4 + i * 0.2,
            repeat: Infinity,
            repeatDelay: Math.random()
          }}
        />
      ))}
    </motion.div>
  );
}
