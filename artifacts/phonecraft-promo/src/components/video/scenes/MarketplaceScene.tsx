import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function MarketplaceScene() {
  return (
    <motion.div
      {...sceneTransitions.zoomThrough}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-20"
           style={{
             backgroundImage: 'linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
           }}
      />

      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[8%] w-full px-8 text-center z-20"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring' }}
      >
        <h2 className="text-5xl font-display font-bold text-white uppercase text-glow-blue mb-2">
          Sell &amp; Earn Instantly
        </h2>
        <p className="text-xl text-[#94A3B8] font-body">Basic • Premium • Gold • Platinum</p>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[15vh] z-10 w-full flex justify-center"
        initial={{ scale: 0.8, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      >
        <PhoneFrame>
          <motion.img 
            src="/phonecraft-promo/screens/10-marketplace-screen.jpg"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, filter: 'blur(5px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1 }}
          />
        </PhoneFrame>
      </motion.div>
      
      {/* Platinum Highlight Particle */}
      <motion.div
        className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[60%] h-[100px] border-2 border-[#8B5CF6] rounded-xl z-20 pointer-events-none"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: [0, 1, 0.5], scale: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
      />

      {/* Sale Notification Popup */}
      <motion.div
        className="absolute top-[18%] right-[6%] bg-[#0F172A]/95 border border-[#8B5CF6]/70 rounded-2xl px-4 py-3 z-30 backdrop-blur-md"
        initial={{ opacity: 0, x: 60, scale: 0.85 }}
        animate={{ opacity: [0, 1, 1, 0], x: [60, 0, 0, 10], scale: [0.85, 1, 1, 0.9] }}
        transition={{ delay: 1.2, duration: 2.2, times: [0, 0.15, 0.8, 1] }}
        style={{ boxShadow: '0 0 18px rgba(139,92,246,0.4)' }}
      >
        <p className="font-display font-bold text-[#8B5CF6] text-xs uppercase tracking-widest mb-1">🔔 Phone Sold!</p>
        <p className="font-body text-white font-bold text-lg leading-none">+৳250 <span className="text-xs text-[#94A3B8] font-normal">credited</span></p>
      </motion.div>
    </motion.div>
  );
}