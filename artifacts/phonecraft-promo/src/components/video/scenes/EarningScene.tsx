import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';
import { useEffect } from 'react';

export function EarningScene() {
  const count = useMotionValue(0);
  const displayCount = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, 5420, {
      duration: 2.5,
      delay: 0.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, [count]);

  return (
    <motion.div
      {...sceneTransitions.wipe}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/20 via-[#070B14] to-[#070B14]" />
      
      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[12%] w-full px-8 text-center z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <h2 className="text-4xl font-display font-bold text-white text-glow-purple uppercase tracking-wide">
          Earn Real Money<br />Anytime
        </h2>
        
        {/* Animated Counter Overlay */}
        <motion.div 
          className="mt-6 font-display font-bold text-6xl text-[#00D4FF] text-glow-blue flex justify-center items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>৳</span>
          <motion.span>{displayCount}</motion.span>
        </motion.div>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[25vh] z-10 w-full flex justify-center"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <PhoneFrame>
          <motion.img 
            src="/phonecraft-promo/screens/11-balance-screen.jpg"
            className="w-full h-full object-cover origin-top"
            initial={{ y: 0 }}
            animate={{ y: -50 }}
            transition={{ duration: 3.5, ease: 'linear' }}
          />
        </PhoneFrame>
      </motion.div>
      
      {/* Floating Currency Symbols */}
      {['৳', '$', '৳', '৳'].map((symbol, i) => (
        <motion.div
          key={i}
          className="absolute text-[#8B5CF6]/40 font-bold text-4xl font-display"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 50,
            opacity: 0
          }}
          animate={{ 
            y: -100, 
            opacity: [0, 1, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 3, 
            delay: i * 0.4,
            repeat: Infinity 
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </motion.div>
  );
}