import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { HookScene } from './scenes/HookScene';
import { LogoIntroScene } from './scenes/LogoIntroScene';
import { ManufacturingScene } from './scenes/ManufacturingScene';
import { EarningScene } from './scenes/EarningScene';
import { MarketplaceScene } from './scenes/MarketplaceScene';
import { ReferralScene } from './scenes/ReferralScene';
import { WalletScene } from './scenes/WalletScene';
import { SupportScene } from './scenes/SupportScene';
import { CTAScene } from './scenes/CTAScene';

const SCENE_DURATIONS = {
  hook: 3000,
  logoIntro: 4000,
  manufacturing: 5000,
  marketplace: 4000,
  earning: 4000,
  referral: 5000,
  wallet: 4000,
  support: 3000,
  cta: 4000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="video-container w-full h-full relative" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <AnimatePresence mode="popLayout">
          {currentScene === 0 && <HookScene key="hook" />}
          {currentScene === 1 && <LogoIntroScene key="logoIntro" />}
          {currentScene === 2 && <ManufacturingScene key="manufacturing" />}
          {currentScene === 3 && <MarketplaceScene key="marketplace" />}
          {currentScene === 4 && <EarningScene key="earning" />}
          {currentScene === 5 && <ReferralScene key="referral" />}
          {currentScene === 6 && <WalletScene key="wallet" />}
          {currentScene === 7 && <SupportScene key="support" />}
          {currentScene === 8 && <CTAScene key="cta" />}
        </AnimatePresence>
      </div>
    </div>
  );
}