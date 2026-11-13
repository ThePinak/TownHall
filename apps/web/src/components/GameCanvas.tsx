import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';
import { useGameStore } from '../store/gameStore';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const setGameLoaded = useGameStore((state) => state.setGameLoaded);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!gameRef.current) {
      const config = createGameConfig(containerRef.current);
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        setGameLoaded(false);
      }
    };
  }, [setGameLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none outline-none focus:outline-none"
      tabIndex={0}
      onFocus={(e) => e.currentTarget.focus()}
    />
  );
};
