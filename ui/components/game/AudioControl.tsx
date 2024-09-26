"use client"
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";

export function AudioControl({ isGameStarted }: { isGameStarted: boolean }) {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isGameStarted && !audioRef.current) {
      audioRef.current = new Audio("/audio/sound.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [isGameStarted, volume]);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setMuted(false);
    audioRef.current!.volume = newVolume[0];
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
    if (audioRef.current) {
      muted ? audioRef.current.play() : audioRef.current.pause();
    }
  };

  if (!isGameStarted) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <Slider
        className="w-24"
        value={[muted ? 0 : volume]}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        aria-label="Adjust volume"
      />
    </div>
  );
}
