import React, { useEffect } from 'react';
import { Play, Sparkles, Trophy, Flame } from 'lucide-react';
import { STRINGS } from '../game/levels';
import titleImage from '../assets/images/title_cat_chicken_1792500562473.jpg';

interface TitleScreenProps {
  highScore: number;
  lang: 'bn' | 'en';
  onStartStory: () => void;
  onStartEndless: () => void;
  onToggleLang: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  highScore,
  lang,
  onStartStory,
  onStartEndless,
  onToggleLang
}) => {
  const t = STRINGS[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStartStory();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartStory]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-stone-950 text-white">
      {/* Background artwork with cinematic subtle zoom & dark ambient vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={titleImage}
          alt="Cat reaching for fried chicken"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
      </div>

      {/* Top Bar with Language Toggle and High Score */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/80">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t.highScore}:</span>
          <span className="text-amber-400 font-bold tabular-nums text-sm">{highScore.toLocaleString()}</span>
        </div>

        <button
          onClick={onToggleLang}
          className="px-3 py-1.5 text-xs font-bold text-amber-200 bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 rounded-lg transition-colors cursor-pointer"
        >
          {lang === 'bn' ? 'English Version' : 'বাংলা সংস্করণ'}
        </button>
      </header>

      {/* Center Hero Lockup & SVG Title */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4 my-auto">
        {/* Inline SVG Title Lockup */}
        <div className="mb-4">
          <svg className="w-full max-w-lg h-24 sm:h-28" viewBox="0 0 500 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chickenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Title Text */}
            <text
              x="250"
              y="70"
              textAnchor="middle"
              className="font-black"
              fill="url(#chickenGrad)"
              filter="url(#glow)"
              style={{
                fontFamily: '"Hind Siliguri", "Outfit", sans-serif',
                fontSize: lang === 'bn' ? '56px' : '48px',
                fontWeight: 900,
                letterSpacing: '1px'
              }}
            >
              {lang === 'bn' ? 'চিকেন বাঁচাও!' : 'CHICKEN RESCUE!'}
            </text>
            {/* Sub-label */}
            <text
              x="250"
              y="100"
              textAnchor="middle"
              fill="#FCD34D"
              opacity="0.85"
              style={{
                fontFamily: '"Outfit", "Hind Siliguri", sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '3px'
              }}
            >
              {lang === 'bn' ? '★ লোভী বিড়াল বনাম রাঁধুনির লড়াই ★' : '★ GREEDY CAT VS THE CHEF ★'}
            </text>
          </svg>
        </div>

        {/* Narrative / Context Brief */}
        <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed mb-6 font-medium">
          {lang === 'bn'
            ? 'টেবিলে রাখা মুচমুচে ফ্রাইড চিকেনের সুবাস পেয়ে বিড়ালগুলো হানা দিয়েছে! তারা খেয়ে ফেলার আগেই চিকেন ড্র্যাগ করে হট-পট বাক্সে সরিয়ে নাও।'
            : 'Mimi the cat smelled the crispy fried chicken and hopped onto the table! Drag and rescue the chicken into the warm hot-pot before the cats gobble them all!'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md">
          <button
            onClick={onStartStory}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-base rounded-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.startBtn}</span>
          </button>

          <button
            onClick={onStartEndless}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-bold text-sm rounded-xl border border-stone-700/80 hover:border-amber-500/50 active:scale-95 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>{t.endlessBtn}</span>
          </button>
        </div>

        {/* Quick Rules Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-8 w-full text-left">
          <div className="p-3 bg-stone-900/70 border border-stone-800/80 rounded-xl">
            <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>🍗</span>
              <span>{lang === 'bn' ? 'চিকেন ড্র্যাগ' : 'Drag Chicken'}</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              {lang === 'bn' ? 'ক্লিক বা ড্র্যাগ করে নিরাপদ হট-পট বক্সে পাঠাও।' : 'Drag chicken into the safe warmer basket.'}
            </p>
          </div>

          <div className="p-3 bg-stone-900/70 border border-stone-800/80 rounded-xl">
            <div className="text-xs font-bold text-rose-300 mb-1 flex items-center gap-1.5">
              <span>🐱</span>
              <span>{lang === 'bn' ? 'বিড়ালের নাকে ট্যাপ' : 'Boop the Nose!'}</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              {lang === 'bn' ? 'বিড়ালের মুখে ট্যাপ করলে বিড়াল ভয় পেয়ে পিছু হটবে।' : 'Tap cat face to boop and scare it away.'}
            </p>
          </div>

          <div className="p-3 bg-stone-900/70 border border-stone-800/80 rounded-xl">
            <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
              <span>🧶</span>
              <span>{lang === 'bn' ? 'খেলনা নিক্ষেপ' : 'Distraction Toys'}</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              {lang === 'bn' ? 'উলের বল ও ক্যাটনিপ ছুড়ে বিড়ালকে অন্যমনস্ক করো।' : 'Throw yarn balls or catnip to distract them.'}
            </p>
          </div>
        </div>
      </main>

      {/* Flat Control Hint Line */}
      <footer className="relative z-10 text-center py-2">
        <p className="text-xs font-medium text-stone-400 tracking-wide">
          {t.controlsHint}
        </p>
      </footer>
    </div>
  );
};
