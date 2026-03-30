import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';

export function CTAScene() {
  return (
    <motion.div
      {...sceneTransitions.clipCircle}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14] overflow-hidden"
    >
      {/* Neon Explosion Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/40 via-[#8B5CF6]/40 to-transparent mix-blend-screen"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      
      <motion.div 
        className="absolute w-[150vw] h-[150vw] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Main Copy */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          className="mb-4"
        >
          <h2 className="text-6xl font-display font-bold text-white uppercase leading-none text-glow-blue mb-2">
            Join 50,000+
          </h2>
          <h3 className="text-5xl font-display font-bold text-[#00D4FF] uppercase text-glow-blue">
            Earners
          </h3>
        </motion.div>

        <motion.p
          className="text-2xl font-body text-[#8B5CF6] font-semibold mb-12 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Start Earning Today
        </motion.p>

        <motion.div
          className="w-full max-w-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        >
          <motion.div 
            className="w-full py-5 bg-gradient-to-r from-[#00D4FF]/20 to-[#8B5CF6]/20 backdrop-blur-md border border-[#00D4FF]/70 rounded-2xl relative overflow-hidden mb-4"
            animate={{ 
              boxShadow: ['0 0 20px rgba(0,212,255,0.4)', '0 0 50px rgba(0,212,255,0.9)', '0 0 20px rgba(0,212,255,0.4)'] 
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10 text-3xl font-display font-bold text-white tracking-wider">
              Download Now
            </span>
          </motion.div>
          <p className="text-lg text-[#94A3B8] font-body">phonecraft.app</p>
        </motion.div>
      </div>

      {/* Final flash to wrap loop */}
      <motion.div
        className="absolute inset-0 bg-black z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 3, times: [0, 0.9, 1] }} // Fades to black right at the end (3s scene) to loop back to hook
      />
    </motion.div>
  );
}