import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene0Hook } from './scenes/Scene0Hook';
import { Scene1Logo } from './scenes/Scene1Logo';
import { Scene2Work } from './scenes/Scene2Work';
import { Scene3Marketplace } from './scenes/Scene3Marketplace';
import { Scene4Wallet } from './scenes/Scene4Wallet';
import { Scene5Deposit } from './scenes/Scene5Deposit';
import { Scene6Referral } from './scenes/Scene6Referral';
import { Scene7Support } from './scenes/Scene7Support';
import { Scene8CTA } from './scenes/Scene8CTA';

const SCENE_DURATIONS = {
  hook: 3500,
  logo: 3000,
  work: 5000,
  marketplace: 4000,
  wallet: 5000,
  deposit: 4000,
  referral: 4000,
  support: 3000,
  cta: 5000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
    loop: true,
  });

  return (
    <div className="fixed inset-0 bg-[#000] flex items-center justify-center">
      <div
        className="w-[390px] h-[844px] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,1)] bg-[#0a0a1a]"
      >
        {/* Persistent Elements */}

        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 z-0 opacity-50"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, #0d0d2b 0%, #0a0a1a 100%)',
              'radial-gradient(circle at 80% 70%, #1a1a3a 0%, #0a0a1a 100%)',
              'radial-gradient(circle at 20% 30%, #0d0d2b 0%, #0a0a1a 100%)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />

        {/* Watermark Logo */}
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Watermark"
          className="absolute top-6 left-6 w-8 h-8 opacity-30 z-50 object-contain"
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: (i % 3) * 2 + 2 + 'px',
                height: (i % 3) * 2 + 2 + 'px',
                backgroundColor: i % 2 === 0 ? '#00d4ff' : '#7c3aed',
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#00d4ff' : '#7c3aed'}`,
                top: '110%',
                left: `${(i * 5.1) % 100}%`,
              }}
              animate={{
                top: '-10%',
                left: [`${(i * 5.1) % 100}%`, `${(i * 7.3) % 100}%`],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: (i % 5) * 4 + 10,
                repeat: Infinity,
                ease: 'linear',
                delay: (i % 8) * 1.2,
              }}
            />
          ))}
        </div>

        {/* Accent Glow Line moving across scenes */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] z-30"
          style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }}
          animate={{
            top: currentScene % 2 === 0 ? '20%' : '80%',
            opacity: [0, 1, 0],
            scaleX: [0.5, 1.5, 0.5],
          }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Scene Container */}
        <AnimatePresence mode="wait">
          {currentScene === 0 && <Scene0Hook key="hook" />}
          {currentScene === 1 && <Scene1Logo key="logo" />}
          {currentScene === 2 && <Scene2Work key="work" />}
          {currentScene === 3 && <Scene3Marketplace key="marketplace" />}
          {currentScene === 4 && <Scene4Wallet key="wallet" />}
          {currentScene === 5 && <Scene5Deposit key="deposit" />}
          {currentScene === 6 && <Scene6Referral key="referral" />}
          {currentScene === 7 && <Scene7Support key="support" />}
          {currentScene === 8 && <Scene8CTA key="cta" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
