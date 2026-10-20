import React from 'react';
import { ArrowRight, RotateCcw, Star, Home, Trophy } from 'lucide-react';
import { GameLevelConfig, GameStats } from '../types/game';
import { STRINGS, GAME_LEVELS } from '../game/levels';

interface LevelClearModalProps {
  stats: GameStats;
  levelConfig: GameLevelConfig;
  lang: 'bn' | 'en';
  onNextLevel: () => void;
  onReplay: () => void;
  onQuit: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  stats,
  levelConfig,
  lang,
  onNextLevel,
  onReplay,
  onQuit
}) => {
  const t = STRINGS[lang];
  const isFinalLevel = stats.level >= GAME_LEVELS.length;

  // Star calculation
  const stars = stats.eatenCount === 0 ? 3 : stats.eatenCount === 1 ? 2 : 1;

  return (
    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-30 select-none">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Star Badges */}
        <div className="flex justify-center items-center gap-2 mb-3">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-all ${
                starIdx <= stars 
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-110' 
                  : 'text-stone-700 fill-stone-800'
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-black text-amber-400 mb-1 font-['Outfit']">
          {isFinalLevel ? (lang === 'bn' ? 'মাস্টার শেফ চ্যাম্পিয়ন!' : 'Grand Master Chef!') : t.levelClearTitle}
        </h2>
        <p className="text-xs text-stone-300 font-medium mb-6">
          {isFinalLevel 
            ? (lang === 'bn' ? 'অভিনন্দন! আপনি সব বিড়ালকে হটিয়ে সম্পূর্ণ ভোজ রক্ষা করেছেন!' : 'Congratulations! You rescued every feast from the royal cats!')
            : (lang === 'bn' ? `লেভেল ${stats.level} সম্পন্ন হয়েছে!` : `Level ${stats.level} successfully cleared!`)}
        </p>

        {/* Stats Recap Box */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 mb-6 text-left flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">{t.score}:</span>
            <span className="font-bold text-amber-400 tabular-nums">{stats.score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">{t.saved}:</span>
            <span className="font-bold text-emerald-400 tabular-nums">{stats.rescuedCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">{t.eaten}:</span>
            <span className="font-bold text-rose-400 tabular-nums">{stats.eatenCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">{lang === 'bn' ? 'সর্বোচ্চ কম্বো' : 'Max Combo'}:</span>
            <span className="font-bold text-amber-300 tabular-nums">{stats.maxCombo}x</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{t.nextLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'রিপ্লে' : 'Replay'}</span>
            </button>

            <button
              onClick={onQuit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.quit}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
