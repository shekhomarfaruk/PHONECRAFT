import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { PhoneFrame } from '../PhoneFrame';

export function WalletScene() {
  const icons = ['₿', '৳', 'N']; // Crypto, bKash, Nagad placeholders
  const colors = ['#F59E0B', '#E11D48', '#EA580C'];

  return (
    <motion.div
      {...sceneTransitions.slideLeft}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#070B14]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#8B5CF6]/20 to-transparent" />

      {/* Header Overlay */}
      <motion.div 
        className="absolute top-[8%] w-full px-6 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-4xl font-display font-bold text-white uppercase text-glow-blue">
          Easy Deposit &amp;<br />Fast Withdraw
        </h2>
        <div className="flex justify-center gap-4 mt-4">
          {['Crypto', 'bKash', 'Nagad'].map((method, i) => (
            <motion.span
              key={method}
              className="px-3 py-1 bg-white/10 rounded-full font-body text-sm text-white backdrop-blur-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {method}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Phone Mockup */}
      <motion.div
        className="mt-[20vh] z-10 w-full flex justify-center"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PhoneFrame>
          <motion.img 
            src="/phonecraft-promo/screens/08-wallet-screen.jpg"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          />
        </PhoneFrame>
      </motion.div>

      {/* Flying Payment Icons */}
      {icons.map((icon, i) => (
        <motion.div
          key={icon}
          className="absolute w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold z-30 shadow-lg"
          style={{ backgroundColor: colors[i] }}
          initial={{ x: -100, y: window.innerHeight, opacity: 0, rotate: -45 }}
          animate={{ x: window.innerWidth * 0.2 + (i * 80), y: window.innerHeight * 0.6, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 1 + i * 0.2 }}
        >
          {icon}
        </motion.div>
      ))}
    </motion.div>
  );
}