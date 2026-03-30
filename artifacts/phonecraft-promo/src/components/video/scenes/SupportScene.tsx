import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function SupportScene() {
  return (
    <motion.div
      {...sceneTransitions.fadeBlur}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      <div className="absolute inset-0 bg-[#00D4FF]/5" />

      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[15%] w-full px-8 text-center z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <h2 className="text-5xl font-display font-bold text-white uppercase text-glow-blue tracking-wider">
          24/7 Live Support
        </h2>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[20vh] z-10 w-full flex justify-center"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <PhoneFrame>
          <img 
            src="/phonecraft-promo/screens/12-support-screen.jpg"
            className="w-full h-full object-cover"
          />
          {/* Animated Chat Bubble */}
          <motion.div 
            className="absolute bottom-[100px] right-[20px] bg-[#8B5CF6] text-white p-3 rounded-2xl rounded-br-none shadow-lg max-w-[80%]"
            initial={{ scale: 0, originX: 1, originY: 1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.8 }}
          >
            <p className="font-body text-sm font-medium">Hello! Welcome to PhoneCraft Support 👋</p>
          </motion.div>
        </PhoneFrame>
      </motion.div>
    </motion.div>
  );
}