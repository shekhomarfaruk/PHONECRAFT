import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { PhoneFrame } from '../PhoneFrame';

export function Scene5Deposit() {
  useEffect(() => {
    setTimeout(() => window.speakText?.("Deposit and withdraw with ease"), 100);
    setTimeout(() => window.playSfx?.(), 300);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-start pt-16 z-20"
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <PhoneFrame src={`${import.meta.env.BASE_URL}screen-balance.jpg`} alt="Deposit and Withdraw" />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
        className="absolute bottom-20 left-0 w-full px-6"
      >
        <div className="bg-[#0a0a1a]/90 backdrop-blur-md border border-[#7c3aed]/30 p-6 rounded-2xl text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h2
            className="text-3xl font-bold text-white mb-2 uppercase tracking-wide"
            style={{ textShadow: '0 0 10px #7c3aed' }}
          >
            Deposit & Withdraw
          </h2>
          <p className="text-[#7c3aed] text-xl font-bold">Fast · Secure · Instant</p>

          <motion.div
            className="mt-4 flex justify-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            {['bKash', 'Crypto', 'Bank'].map((method) => (
              <div
                key={method}
                className="bg-[#7c3aed]/20 border border-[#7c3aed]/40 rounded-full px-3 py-1 text-[#00d4ff] text-sm font-semibold"
              >
                {method}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
