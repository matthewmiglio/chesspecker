"use client";

import { useRef, useCallback, useEffect } from "react";

type SoundType = "move" | "take" | "check";

// Create audio elements once at module level
let audioElements: Record<SoundType, HTMLAudioElement> | null = null;

function getAudioElements(): Record<SoundType, HTMLAudioElement> {
  if (!audioElements && typeof window !== "undefined") {
    audioElements = {
      move: new Audio("/sfx/move.wav"),
      take: new Audio("/sfx/take.wav"),
      check: new Audio("/sfx/check.wav"),
    };
    // Preload
    Object.values(audioElements).forEach((audio) => {
      audio.load();
      audio.volume = 0.5;
    });
  }
  return audioElements!;
}

export function useSfx(enabled: boolean = true) {
  const hasInteracted = useRef(false);
  const enabledRef = useRef(enabled);

  // Keep ref in sync with prop
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    // Initialize audio elements
    getAudioElements();

    // Unlock audio on first user interaction
    const unlock = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        const audios = getAudioElements();
        if (audios) {
          // Play and immediately pause to unlock audio context
          Object.values(audios).forEach((audio) => {
            audio.play().then(() => {
              audio.pause();
              audio.currentTime = 0;
            }).catch(() => {});
          });
        }
      }
    };

    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;

    const audios = getAudioElements();
    if (audios) {
      const audio = audios[type];
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio play failed:", type, err);
      });
    }
  }, []);

  return { play };
}
