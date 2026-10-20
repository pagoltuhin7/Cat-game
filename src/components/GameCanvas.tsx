import React, { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameLevelConfig, GameMode, GameStats, ToyType } from '../types/game';

interface GameCanvasProps {
  level: number;
  mode: GameMode;
  onStatsUpdate: (stats: GameStats, isOver: boolean, isWon: boolean) => void;
  onRegisterEngine: (engine: GameEngine) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  mode,
  onStatsUpdate,
  onRegisterEngine
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize Canvas & Game Engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, onStatsUpdate);
    engineRef.current = engine;
    onRegisterEngine(engine);

    engine.startLevel(level, mode);

    return () => {
      engine.stop();
    };
  }, []); // Run once on mount

  // Handle pointer coordinate mapping correctly with CSS scaling
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    engineRef.current?.handlePointerDown(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    engineRef.current?.handlePointerMove(coords.x, coords.y);
  };

  const handlePointerUp = () => {
    engineRef.current?.handlePointerUp();
  };

  return (
    <div className="relative w-full h-full overflow-hidden cursor-crosshair touch-none select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block"
      />
    </div>
  );
};
