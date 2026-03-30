import { motion } from 'framer-motion';

export function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative w-[280px] h-[580px] rounded-[32px] p-[3px] mx-auto z-20 overflow-visible mt-[80px]"
    >
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-[#00d4ff] to-[#7c3aed] shadow-[0_0_40px_rgba(124,58,237,0.4)] animate-pulse" />
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative w-full h-full bg-[#0a0a1a] rounded-[29px] overflow-hidden flex items-center justify-center border-4 border-black"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        
        {/* Glare overlay */}
        <div className="absolute top-0 left-0 w-[200%] h-[50%] bg-gradient-to-b from-white/10 to-transparent rotate-[-15deg] pointer-events-none translate-y-[-20%] translate-x-[-20%]" />
      </motion.div>
    </motion.div>
  );
}
