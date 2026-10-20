import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { STRINGS } from '../game/levels';

interface PauseModalProps {
  lang: 'bn' | 'en';
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  lang,
  isMuted,
  onResume,
  onRestart,
  onQuit,
  onToggleMute
}) => {
  const t = STRINGS[lang];

  return (
    <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-30 select-none">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-2xl font-black text-amber-400 mb-2 font-['Outfit']">
          {t.pausedTitle}
        </h2>
        <p className="text-xs text-stone-300 mb-6 font-medium">
          {lang === 'bn' ? 'খেলা সাময়িক বন্ধ আছে। আপনি কি এগিয়ে যাবেন?' : 'Game is paused. Ready to continue defending the feast?'}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? t.soundOff : t.soundOn}</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-stone-400 hover:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer mt-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.quit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
