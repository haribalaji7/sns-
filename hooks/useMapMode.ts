'use client';

import { useState, useCallback } from 'react';

export type MapMode = 'roadmap' | 'satellite' | 'hybrid' | 'terrain' | '3d';

export function useMapMode(
  onModeChange?: (mode: MapMode, mapTypeId: 'roadmap' | 'satellite' | 'hybrid' | 'terrain', tilt: number) => void,
) {
  const [currentMode, setCurrentMode] = useState<MapMode>('roadmap');

  const setMode = useCallback(
    (mode: MapMode) => {
      setCurrentMode(mode);

      if (mode === '3d') {
        onModeChange?.('3d', 'satellite', 45);
      } else if (mode === 'satellite') {
        onModeChange?.('satellite', 'satellite', 0);
      } else if (mode === 'hybrid') {
        onModeChange?.('hybrid', 'hybrid', 0);
      } else if (mode === 'terrain') {
        onModeChange?.('terrain', 'terrain', 0);
      } else {
        onModeChange?.('roadmap', 'roadmap', 0);
      }
    },
    [onModeChange],
  );

  return {
    currentMode,
    setMode,
  };
}
