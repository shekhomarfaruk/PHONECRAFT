import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';

export function HookScene() {
  return (
    <motion.div
      {...sceneTransitions.scaleFade}
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#070B14] overflow-hidden"
    >
      {/* Particle Burst System */}
      <div className="relative w-full h-full flex items-center justify-center">
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const radius = 150 + Math.random() * 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const color = Math.random() > 0.5 ? '#00D4FF' : '#8B5CF6';
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x,
                y,
                scale: [0, Math.random() * 2 + 1, 0],
                opacity: [1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: Math.random() * 0.2
              }}
            />
          );
        })}

        {/* Central Energy Core */}
        <motion.div
          className="absolute w-32 h-32 rounded-full blur-[40px]"
          style={{ backgroundColor: '#00D4FF' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-24 h-24 rounded-full blur-[30px]"
          style={{ backgroundColor: '#8B5CF6' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Flash Overlay */}
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, times: [0, 0.1, 1] }}
        />

        {/* Hook Question */}
        <motion.div
          className="absolute bottom-[20%] w-full text-center px-8 z-30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold text-white leading-tight">
            Still not earning<br />
            <span className="text-[#00D4FF] text-glow-blue">online?</span>
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
}