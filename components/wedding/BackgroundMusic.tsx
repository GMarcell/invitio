"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

// Place your background track at public/music/background.mp3
const AUDIO_SRC = "/music/background.mp3";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const manualOverrideRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.55;
    // Start muted so the browser allows autoplay; the visitor's first tap
    // anywhere on the page (or the toggle button) brings the sound in.
    audio.muted = true;
    audioRef.current = audio;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Unmute + play on the visitor's first interaction anywhere (browsers block
  // audible autoplay). Skipped once the visitor has used the toggle themselves.
  useEffect(() => {
    const unlock = () => {
      const audio = audioRef.current;
      if (audio && !manualOverrideRef.current) {
        audio.muted = false;
        void audio.play().then(() => setPlaying(true));
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    manualOverrideRef.current = true;

    if (audio.paused || audio.muted) {
      audio.muted = false;
      void audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause background music" : "Play background music"}
      title={playing ? "Pause music" : "Play music"}
      className="fixed bottom-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#E7DDCA]/25 bg-[#071827]/80 text-[#E7DDCA] backdrop-blur-md transition hover:border-[#E7DDCA]/60 hover:text-[#F4EFE5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7DDCA] sm:bottom-5 sm:left-5"
    >
      {playing ? (
        <Music className="h-4 w-4 animate-pulse" strokeWidth={1.5} />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
