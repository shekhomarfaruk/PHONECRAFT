import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

export function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
  return (
    <motion.div 
      className={`relative w-[75%] aspect-[9/19.5] bg-black rounded-[40px] p-[8px] mx-auto overflow-hidden shadow-2xl border-[2px] border-slate-800 ${className}`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 212, 255, 0.2)'
      }}
    >
      {/* Notch */}
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[35%] h-[24px] bg-black rounded-[20px] z-50 flex items-center justify-center border border-slate-800/50">
        <div className="w-[8px] h-[8px] rounded-full bg-[#111] mx-1 border border-slate-700/50"></div>
        <div className="w-[4px] h-[4px] rounded-full bg-[#00D4FF]/40 mx-1"></div>
      </div>
      
      {/* Screen Area */}
      <div className="relative w-full h-full bg-[#0F172A] rounded-[32px] overflow-hidden">
        {children}
      </div>
      
      {/* Side buttons */}
      <div className="absolute left-[-2px] top-[100px] w-[2px] h-[30px] bg-slate-700 rounded-l-sm"></div>
      <div className="absolute left-[-2px] top-[140px] w-[2px] h-[45px] bg-slate-700 rounded-l-sm"></div>
      <div className="absolute left-[-2px] top-[195px] w-[2px] h-[45px] bg-slate-700 rounded-l-sm"></div>
      <div className="absolute right-[-2px] top-[120px] w-[2px] h-[60px] bg-slate-700 rounded-r-sm"></div>
    </motion.div>
  );
}