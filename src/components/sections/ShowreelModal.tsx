"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Play, Pause, Film } from "lucide-react";
import { useState, useRef } from "react";
import { useSound } from "@/components/fx/SoundProvider";

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
  artist?: string;
  gearList?: string[];
}

export default function ShowreelModal({
  isOpen,
  onClose,
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  title = "ONSET PRODUCTION 2026 DIRECTORS REEL",
  artist = "FEAT. WARNER, DEF JAM & SONY ARTISTS",
  gearList = ["ARRI Alexa Mini LF", "Cooke Anamorphic /i 2x", "Aputure 1200d Pro", "DJI Ronin 2"],
}: ShowreelModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { playHoverSound, playShutterSound } = useSound();

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playShutterSound();
              onClose();
            }}
            style={{ willChange: "opacity" }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="relative w-full max-w-5xl bg-neutral-950 border-2 border-red-600/60 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(255,0,0,0.5)] z-10 flex flex-col"
          >
            {/* Header HUD */}
            <div className="flex justify-between items-center bg-black px-6 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-red-600 animate-pulse" />
                <div>
                  <h3 className="font-display text-xl text-white tracking-wider uppercase">
                    {title}
                  </h3>
                  <p className="text-[13px] font-mono text-neutral-400">{artist}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  playHoverSound();
                  onClose();
                }}
                aria-label="Close showreel modal"
                className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
              >
                <track kind="captions" srcLang="en" label="English" default={false} />
              </video>

              {/* HUD Camera Frame Lines */}
              <div className="hud-corner hud-tl" />
              <div className="hud-corner hud-tr" />
              <div className="hud-corner hud-bl" />
              <div className="hud-corner hud-br" />

              {/* On-Video Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause video showreel" : "Play video showreel"}
                      className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_#ff0000] transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute showreel audio" : "Mute showreel audio"}
                      className="p-3 rounded-full bg-neutral-900/90 border border-neutral-800 text-white hover:border-red-600 transition-all cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <span className="font-mono text-[13px] text-neutral-300 bg-black/60 px-3 py-1.5 rounded-lg border border-neutral-800">
                    24 FPS | 4K CINEMA DNG
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Specifications */}
            <div className="bg-neutral-900/90 px-6 py-4 border-t border-neutral-800 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-neutral-400 uppercase">CAMERA & RIG:</span>
                <div className="flex flex-wrap gap-2">
                  {gearList.map((g) => (
                    <span
                      key={g}
                      className="text-[11px] font-mono bg-black text-red-400 px-2.5 py-1 rounded border border-red-950"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href="#contact"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-[13px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all"
              >
                REQUEST PRODUCTION
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
