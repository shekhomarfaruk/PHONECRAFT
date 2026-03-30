import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function Scene3Marketplace() {
  useEffect(() => {
    setTimeout(() => window.playSfx?.(), 300);
    setTimeout(() => window.speakText?.("Choose a plan and start earning more"), 100);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4"
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Section title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4 text-center"
      >
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: '#7c3aed' }}
        >
          Investment Plans
        </span>
        <h2
          className="text-2xl font-extrabold text-white mt-1 uppercase tracking-tight"
          style={{ textShadow: '0 0 15px #00d4ff' }}
        >
          Choose Your Plan
        </h2>
      </motion.div>

      {/* Plans screenshot displayed as a wide screen card */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.35 }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 40px rgba(124,58,237,0.45), 0 0 80px rgba(0,212,255,0.15)',
          border: '2px solid rgba(0,212,255,0.3)',
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}screen-plans.png`}
          alt="Investment Plans"
          className="w-full object-cover"
          style={{ display: 'block' }}
        />

        {/* neon glow overlay at top and bottom */}
        <div
          className="absolute inset-x-0 top-0 h-6 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.12), transparent)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-6 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(124,58,237,0.18), transparent)' }}
        />
      </motion.div>

      {/* Subtitle badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
        className="mt-5 flex gap-3 flex-wrap justify-center"
      >
        {['BASIC', 'PREMIUM', 'GOLD', 'PLATINUM'].map((plan, i) => (
          <motion.span
            key={plan}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 300 }}
            className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{
              color: i === 3 ? '#f59e0b' : i === 2 ? '#fbbf24' : i === 1 ? '#a78bfa' : '#00d4ff',
              borderColor: i === 3 ? '#f59e0b55' : i === 2 ? '#fbbf2455' : i === 1 ? '#a78bfa55' : '#00d4ff55',
              background: 'rgba(10,10,26,0.7)',
            }}
          >
            {plan}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
