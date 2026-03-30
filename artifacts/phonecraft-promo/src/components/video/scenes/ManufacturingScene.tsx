import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function ManufacturingScene() {
  return (
    <motion.div
      {...sceneTransitions.slideUp}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/10 to-transparent" />
      
      {/* Background Blur elements */}
      <motion.div 
        className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-[#00D4FF]/20 rounded-full blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[10%] w-full px-8 text-center z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <h2 className="text-5xl font-display font-bold text-white text-glow-blue uppercase">
          Build Your Own<br />Virtual Phones
        </h2>
        <motion.div 
          className="mt-4 inline-block px-6 py-2 bg-[#8B5CF6]/20 border border-[#8B5CF6] rounded-full backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <span className="text-[#8B5CF6] font-display font-bold text-2xl">৳0.81 PER TASK</span>
        </motion.div>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[20vh] z-10 w-full flex justify-center"
        initial={{ y: 200, scale: 0.9, rotateX: 20 }}
        animate={{ y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000 }}
      >
        <PhoneFrame>
          <motion.img 
            src="/phonecraft-promo/screens/07-work-screen.jpg"
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 3, ease: 'easeOut' }}
          />
          {/* Scanning Effect Overlay */}
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-[#00D4FF] shadow-[0_0_15px_#00D4FF]"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </PhoneFrame>
      </motion.div>

      {/* Task Completion Notification Toast */}
      <motion.div
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 bg-[#0F172A]/90 border border-[#00D4FF]/60 rounded-2xl px-5 py-3 flex items-center gap-3 z-30 backdrop-blur-md"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: [0, 1, 1, 0], y: [30, 0, 0, -10], scale: [0.9, 1, 1, 0.95] }}
        transition={{ delay: 1.5, duration: 2.5, times: [0, 0.15, 0.8, 1] }}
        style={{ boxShadow: '0 0 20px rgba(0,212,255,0.3)', minWidth: '200px' }}
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-display font-bold text-white text-sm uppercase tracking-wide">Task Complete!</p>
          <p className="font-body text-[#00D4FF] font-bold text-lg">+৳0.81 Earned</p>
        </div>
      </motion.div>
    </motion.div>
  );
}