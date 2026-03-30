import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function Scene8CTA() {
  useEffect(() => {
    setTimeout(() => window.playSfx?.(), 300);
    setTimeout(() => window.speakText?.("Join fifty-eight thousand members at PhoneCraft dot tech"), 100);
  }, []);

  const stats = [
    { label: "Members", value: "58,800+" },
    { label: "Per Task", value: "$0.81" },
    { label: "Countries", value: "7" }
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center pt-8 z-20 px-8"
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img 
        src={`${import.meta.env.BASE_URL}logo.png`} 
        alt="PhoneCraft" 
        className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.3 }}
      />
      
      <div className="w-full space-y-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 + (i * 0.2), type: "spring" }}
            className="flex flex-col items-center border-b border-white/10 pb-4"
          >
            <span className="text-4xl font-bold text-white tracking-wider" style={{ textShadow: "0 0 15px #7c3aed" }}>
              {stat.value}
            </span>
            <span className="text-[#00d4ff] text-sm uppercase tracking-widest mt-1">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 1.6, type: "spring" }}
        className="w-full"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] p-[2px]">
          <div className="bg-[#0a0a1a] rounded-[14px] p-4 text-center">
            <motion.p 
              className="text-2xl font-bold text-white tracking-widest"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              phonecraft.tech
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
