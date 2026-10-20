import React from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';
import { GameLevelConfig, GameStats, ToyType } from '../types/game';
import { STRINGS } from '../game/levels';

interface HUDProps {
  stats: GameStats;
  levelConfig: GameLevelConfig;
  isPaused: boolean;
  isMuted: boolean;
  lang: 'bn' | 'en';
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleLang: () => void;
  onThrowToy: (type: ToyType) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  levelConfig,
  isPaused,
  isMuted,
  lang,
  onTogglePause,
  onToggleMute,
  onToggleLang,
  onThrowToy
}) => {
  const t = STRINGS[lang];
  const maxAllowed = levelConfig.maxAllowedEaten;
  const livesLeft = Math.max(0, maxAllowed - stats.eatenCount);
  const targetRescues = levelConfig.targetRescues;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none z-10">
      {/* Top Perimeter HUD Bar */}
      <header className="flex items-start justify-between gap-4">
        {/* Left cluster: Level & Score */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/90 tracking-wide">
            <span>{t.level} {stats.level}</span>
            <span aria-hidden="true" className="text-amber-500">·</span>
            <span>{lang === 'bn' ? levelConfig.titleBn : levelConfig.titleEn}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 tabular-nums tracking-tight drop-shadow-md">
              {stats.score.toLocaleString()}
            </span>
            {stats.combo > 1 && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                {stats.combo}x {t.combo}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right cluster: Lives, Targets, and Controls */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {/* Rescue Progress meter */}
          <div className="bg-stone-900/85 border border-stone-700/60 rounded-xl px-3.5 py-2 shadow-lg flex flex-col items-end min-w-[120px]">
            <span className="text-[11px] text-stone-300 font-medium">
              {t.saved}: <strong className="text-emerald-400 tabular-nums">{stats.rescuedCount}</strong> / {stats.mode === 'LEVELS' ? targetRescues : '∞'}
            </span>
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (stats.rescuedCount / (targetRescues || 10)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Lives (Fried Chicken Legs remaining before cats win) */}
          <div className="bg-stone-900/85 border border-stone-700/60 rounded-xl px-3.5 py-2 shadow-lg flex flex-col items-center">
            <span className="text-[11px] text-stone-300 font-medium mb-1">{t.lives}</span>
            <div className="flex gap-1">
              {Array.from({ length: maxAllowed }).map((_, i) => (
                <span
                  key={i}
                  className={`text-base transition-transform ${
                    i < livesLeft ? 'opacity-100 scale-100' : 'opacity-25 grayscale scale-90'
                  }`}
                  title={i < livesLeft ? 'Chicken Safe' : 'Chicken Eaten'}
                >
                  🍗
                </span>
              ))}
            </div>
          </div>

          {/* Functional Buttons: Mute, Pause, Lang */}
          <div className="flex items-center gap-1.5 bg-stone-900/85 border border-stone-700/60 rounded-xl p-1 shadow-lg">
            <button
              onClick={onToggleMute}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title={isMuted ? t.soundOff : t.soundOn}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onTogglePause}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title={isPaused ? t.resume : t.pause}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-stone-300" />}
            </button>

            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="বাংলা / English"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Perimeter HUD: Distraction Toys Toolbar */}
      <footer className="flex items-end justify-between gap-4">
        {/* Toys Toolbar */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold text-amber-300/80 uppercase tracking-wider">
            {t.toysTitle}
          </div>
          <div className="flex items-center gap-2">
            {/* Yarn Ball Button */}
            <button
              onClick={() => onThrowToy('YARN_BALL')}
              disabled={stats.toys.yarn <= 0}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all shadow-md cursor-pointer ${
                stats.toys.yarn > 0 
                  ? 'bg-rose-950/85 border-rose-500/40 text-rose-200 hover:bg-rose-900 active:scale-95' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">🧶</span>
              <span className="whitespace-nowrap">{t.toyYarn}</span>
              <span className="bg-rose-800/80 text-rose-100 text-[10px] px-1.5 py-0.5 rounded-md tabular-nums">
                {stats.toys.yarn}
              </span>
            </button>

            {/* Catnip Button */}
            <button
              onClick={() => onThrowToy('CATNIP')}
              disabled={stats.toys.catnip <= 0}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all shadow-md cursor-pointer ${
                stats.toys.catnip > 0 
                  ? 'bg-emerald-950/85 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900 active:scale-95' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">🌿</span>
              <span className="whitespace-nowrap">{t.toyCatnip}</span>
              <span className="bg-emerald-800/80 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-md tabular-nums">
                {stats.toys.catnip}
              </span>
            </button>
          </div>
        </div>

        {/* Quiet Help Reminder */}
        <div className="hidden sm:block text-right text-[11px] text-amber-200/60 pointer-events-none">
          <span>{lang === 'bn' ? 'বিড়ালের নাকে ক্লিক করে তাড়িয়ে দাও!' : 'Click cat nose to boop & scare away!'}</span>
        </div>
      </footer>
    </div>
  );
};
