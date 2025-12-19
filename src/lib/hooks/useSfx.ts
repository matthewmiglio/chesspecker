"use client";

import { useRef, useCallback, useEffect } from "react";

type SoundType = "move" | "take" | "check";

export function useSfx() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    move: null,
    take: null,
    check: null,
  });

  useEffect(() => {
    audioRefs.current.move = new Audio("/sfx/move.wav");
    audioRefs.current.take = new Audio("/sfx/take.wav");
    audioRefs.current.check = new Audio("/sfx/check.wav");

    // Preload audio files
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.load();
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browser blocked autoplay - silently ignore
      });
    }
  }, []);

  return { play };
}
