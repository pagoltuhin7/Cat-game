import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { LevelClearModal } from './components/LevelClearModal';
import { GameOverModal } from './components/GameOverModal';
import { GameEngine } from './game/GameEngine';
import { GameMode, GameStats, GameStatus, ToyType } from './types/game';
import { GAME_LEVELS } from './game/levels';
import { sound } from './audio/soundEffects';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [mode, setMode] = useState<GameMode>('LEVELS');
  const [level, setLevel] = useState<number>(1);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('chicken_game_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    rescuedCount: 0,
    eatenCount: 0,
    combo: 0,
    maxCombo: 0,
    level: 1,
    mode: 'LEVELS',
    toys: { yarn: 2, catnip: 2, bell: 1 }
  });

  const engineRef = useRef<GameEngine | null>(null);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('chicken_game_lang');
    if (savedLang === 'en' || savedLang === 'bn') {
      setLang(savedLang);
    }
  }, []);

  const handleToggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('chicken_game_lang', nextLang);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleRegisterEngine = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats, isOver: boolean, isWon: boolean) => {
    setStats(newStats);

    if (newStats.score > highScore) {
      setHighScore(newStats.score);
      localStorage.setItem('chicken_game_highscore', String(newStats.score));
    }

    if (isOver) {
      setStatus('GAME_OVER');
    } else if (isWon) {
      setStatus('LEVEL_CLEAR');
    }
  }, [highScore]);

  // Start story mode
  const handleStartStory = () => {
    setLevel(1);
    setMode('LEVELS');
    setStatus('PLAYING');
    if (engineRef.current) {
      engineRef.current.startLevel(1, 'LEVELS');
    }
  };

  // Start endless arcade frenzy
  const handleStartEndless = () => {
    setLevel(3); // Start with balanced difficulty for endless
    setMode('ENDLESS');
    setStatus('PLAYING');
    if (engineRef.current) {
      engineRef.current.startLevel(3, 'ENDLESS');
    }
  };

  const handleTogglePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (engineRef.current) engineRef.current.isPaused = true;
    } else if (status === 'PAUSED') {
      setStatus('PLAYING');
      if (engineRef.current) engineRef.current.isPaused = false;
    }
  };

  const handleRestart = () => {
    setStatus('PLAYING');
    if (engineRef.current) {
      engineRef.current.startLevel(level, mode);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = Math.min(level + 1, GAME_LEVELS.length);
    setLevel(nextLevel);
    setStatus('PLAYING');
    if (engineRef.current) {
      engineRef.current.startLevel(nextLevel, mode);
    }
  };

  const handleQuitToMenu = () => {
    setStatus('TITLE');
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  const handleThrowToy = (type: ToyType) => {
    if (engineRef.current) {
      engineRef.current.throwToy(type);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'PLAYING') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          handleTogglePause();
        } else if (e.code === 'Digit1') {
          handleThrowToy('YARN_BALL');
        } else if (e.code === 'Digit2') {
          handleThrowToy('CATNIP');
        } else if (e.code === 'Digit3') {
          handleThrowToy('BELL_RATTLE');
        }
      } else if (status === 'PAUSED') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          handleTogglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const levelConfigIndex = Math.min(level - 1, GAME_LEVELS.length - 1);
  const currentConfig = GAME_LEVELS[levelConfigIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-['Outfit'] select-none">
      {status === 'TITLE' ? (
        <TitleScreen
          highScore={highScore}
          lang={lang}
          onStartStory={handleStartStory}
          onStartEndless={handleStartEndless}
          onToggleLang={handleToggleLang}
        />
      ) : (
        <>
          {/* Active Canvas Gamefield */}
          <GameCanvas
            level={level}
            mode={mode}
            onStatsUpdate={handleStatsUpdate}
            onRegisterEngine={handleRegisterEngine}
          />

          {/* Low-Occlusion Game HUD */}
          <HUD
            stats={stats}
            levelConfig={currentConfig}
            isPaused={status === 'PAUSED'}
            isMuted={isMuted}
            lang={lang}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
            onToggleLang={handleToggleLang}
            onThrowToy={handleThrowToy}
          />

          {/* Modals for Pause, Level Clear, Game Over */}
          {status === 'PAUSED' && (
            <PauseModal
              lang={lang}
              isMuted={isMuted}
              onResume={handleTogglePause}
              onRestart={handleRestart}
              onQuit={handleQuitToMenu}
              onToggleMute={handleToggleMute}
            />
          )}

          {status === 'LEVEL_CLEAR' && (
            <LevelClearModal
              stats={stats}
              levelConfig={currentConfig}
              lang={lang}
              onNextLevel={handleNextLevel}
              onReplay={handleRestart}
              onQuit={handleQuitToMenu}
            />
          )}

          {status === 'GAME_OVER' && (
            <GameOverModal
              stats={stats}
              highScore={highScore}
              lang={lang}
              onRestart={handleRestart}
              onQuit={handleQuitToMenu}
            />
          )}
        </>
      )}
    </div>
  );
}
