import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function LogoIntroScene() {
  const text = "PHONECRAFT";

  return (
    <motion.div
      {...sceneTransitions.scaleFade}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      {/* Background Rings */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full border border-[#00D4FF]/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full border border-[#8B5CF6]/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Welcome tag */}
      <motion.p
        className="absolute top-[12%] text-xl font-body text-[#8B5CF6] tracking-widest uppercase z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Welcome to
      </motion.p>

      <div className="relative z-10 flex flex-col items-center mt-12">
        {/* Logo Mark */}
        <motion.div
          className="relative w-40 h-40 mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="absolute inset-0 rounded-full glow-blue blur-md opacity-50" />
          <img 
            src="/phonecraft-promo/screens/04-logo-close.jpg" 
            alt="PhoneCraft Logo" 
            className="w-full h-full object-cover rounded-full border-2 border-[#00D4FF] relative z-10"
          />
        </motion.div>

        {/* Kinetic Type */}
        <div className="flex overflow-hidden perspective-[1000px]">
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6]"
              initial={{ y: 100, rotateX: -90, opacity: 0 }}
              animate={{ y: 0, rotateX: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.5 + index * 0.05,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="mt-4 text-lg font-body text-[#94A3B8] tracking-widest uppercase text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Virtual Phone Manufacturing · Earn Real Taka
        </motion.p>

        {/* App Preview - Home Dashboard */}
        <motion.div
          className="mt-6 w-[45%]"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
        >
          <PhoneFrame>
            <img
              src="/phonecraft-promo/screens/06-home-dashboard.jpg"
              className="w-full h-full object-cover"
            />
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}