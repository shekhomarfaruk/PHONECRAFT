import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function ReferralScene() {
  return (
    <motion.div
      {...sceneTransitions.perspectiveFlip}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      {/* Node Network Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path 
          d="M50 80 L30 50 L50 20 L70 50 Z M50 80 L50 50 M30 50 L70 50" 
          stroke="#00D4FF" 
          strokeWidth="0.5" 
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {[
          [50, 80], [30, 50], [70, 50], [50, 20]
        ].map(([x, y], i) => (
          <motion.circle 
            key={i} 
            cx={x} cy={y} r="2" 
            fill="#8B5CF6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: 1 + i * 0.2 }}
          />
        ))}
      </svg>

      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[10%] w-full px-6 text-center z-20"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <h2 className="text-4xl font-display font-bold text-white uppercase leading-tight text-glow-purple">
          Invite Friends<br />
          <span className="text-[#00D4FF] text-5xl">&amp; Earn More</span>
        </h2>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[20vh] z-10 w-full flex justify-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <PhoneFrame>
          <motion.img 
            src="/phonecraft-promo/screens/09-refer-screen.jpg"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 4, ease: 'linear' }}
          />
          {/* QR Code Pulse Effect */}
          <motion.div 
            className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-lg border-4 border-[#00D4FF]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
          />
        </PhoneFrame>
      </motion.div>
    </motion.div>
  );
}