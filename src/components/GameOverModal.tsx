import React from 'react';
import { RotateCcw, Home, Trophy } from 'lucide-react';
import { GameStats } from '../types/game';
import { STRINGS } from '../game/levels';

interface GameOverModalProps {
  stats: GameStats;
  highScore: number;
  lang: 'bn' | 'en';
  onRestart: () => void;
  onQuit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  lang,
  onRestart,
  onQuit
}) => {
  const t = STRINGS[lang];
  const isNewHigh = stats.score > highScore;

  return (
    <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-30 select-none">
      <div className="bg-stone-900 border border-rose-900/60 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Sad Cat / Devoured Chicken Graphic */}
        <div className="text-4xl mb-3 animate-bounce">
          🍗😿
        </div>

        <h2 className="text-2xl font-black text-rose-400 mb-1 font-['Outfit']">
          {t.gameOverTitle}
        </h2>
        <p className="text-xs text-stone-300 font-medium mb-5">
          {t.gameOverDesc}
        </p>

        {/* Score & Record Summary */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 mb-6 text-left flex flex-col gap-2">
          {isNewHigh && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-md border border-amber-600/40">
              <Trophy className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন সর্বোচ্চ রেকর্ড!' : 'NEW HIGH SCORE!'}</span>
            </div>
          )}

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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.quit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
