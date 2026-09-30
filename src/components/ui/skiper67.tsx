"use client";

import { motion, useSpring } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type { ComponentProps } from "react";
import React, { memo, forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

export const VideoPlayer = ({ style, ...props }: VideoPlayerProps) => (
  <MediaController
    style={{
      ...style,
    }}
    {...props}
  />
);

export type VideoPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

export const VideoPlayerControlBar = (props: VideoPlayerControlBarProps) => (
  <MediaControlBar {...props} />
);

export type VideoPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: VideoPlayerTimeRangeProps) => (
  <MediaTimeRange
    className={cn(
      "[--media-range-thumb-opacity:1] [--media-range-thumb-background:#E50914] [--media-range-bar-color:#E50914] [--media-range-track-height:3px]",
      className,
    )}
    {...props}
  />
);

export type VideoPlayerTimeDisplayProps = ComponentProps<
  typeof MediaTimeDisplay
>;

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}: VideoPlayerTimeDisplayProps) => (
  <MediaTimeDisplay className={cn("p-2 font-mono text-xs text-neutral-300", className)} {...props} />
);

export type VideoPlayerVolumeRangeProps = ComponentProps<
  typeof MediaVolumeRange
>;

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}: VideoPlayerVolumeRangeProps) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("text-white hover:text-[#E50914] transition-colors cursor-pointer", className)} {...props} />
);

export type VideoPlayerSeekBackwardButtonProps = ComponentProps<
  typeof MediaSeekBackwardButton
>;

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}: VideoPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton className={cn("p-2.5 text-white hover:text-[#E50914] transition-colors", className)} {...props} />
);

export type VideoPlayerSeekForwardButtonProps = ComponentProps<
  typeof MediaSeekForwardButton
>;

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}: VideoPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton className={cn("p-2.5 text-white hover:text-[#E50914] transition-colors", className)} {...props} />
);

export type VideoPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("text-white hover:text-[#E50914] transition-colors cursor-pointer", className)} {...props} />
);

export type VideoPlayerFullscreenButtonProps = ComponentProps<typeof MediaFullscreenButton>;

export const VideoPlayerFullscreenButton = ({
  className,
  ...props
}: VideoPlayerFullscreenButtonProps) => (
  <MediaFullscreenButton className={cn("text-white hover:text-[#E50914] transition-colors cursor-pointer", className)} {...props} />
);

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = forwardRef<HTMLVideoElement, VideoPlayerContentProps>(
  ({ className, ...props }, ref) => (
    <video ref={ref} className={cn("mb-0 mt-0", className)} {...props} />
  )
);
VideoPlayerContent.displayName = "VideoPlayerContent";

export interface Skiper67Handle {
  play: (unmute?: boolean) => Promise<void>;
  pause: () => void;
  unmute: () => void;
  mute: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

export interface Skiper67Props {
  videoSrc?: string;
  poster?: string;
  className?: string;
  hintText?: string;
  badgeText?: string;
}

export const Skiper67 = memo(
  forwardRef<Skiper67Handle, Skiper67Props>(
    (
      {
        videoSrc = "/showcase_video.mp4",
        poster = "/showcase_poster.jpg",
        className,
        hintText = "DIRECTOR'S CUT • 4K MASTER SHOWREEL",
        badgeText = "NOW PLAYING",
      },
      ref,
    ) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const videoRef = useRef<HTMLVideoElement>(null);

      const [isPlaying, setIsPlaying] = useState(false);
      const [isMuted, setIsMuted] = useState(true);
      const [isNearViewport, setIsNearViewport] = useState(false);

      // Lazy load video source only when within 300px of viewport
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
          const fallbackTimer = window.setTimeout(() => setIsNearViewport(true), 0);
          return () => window.clearTimeout(fallbackTimer);
        }

        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry && entry.isIntersecting) {
              setIsNearViewport(true);
              observer.disconnect();
            }
          },
          { rootMargin: "300px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
      }, []);

      // Magnetic spring physics for cursor tracking
      const SPRING = { mass: 0.1, stiffness: 140, damping: 15 };
      const x = useSpring(0, SPRING);
      const y = useSpring(0, SPRING);
      const opacity = useSpring(0, SPRING);

      const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        opacity.set(1);
        x.set(e.nativeEvent.offsetX);
        y.set(e.nativeEvent.offsetY);
      }, [opacity, x, y]);

      const handlePointerLeave = useCallback(() => {
        opacity.set(0);
      }, [opacity]);

      // Direct Imperative Handle with graceful unmuted -> muted fallback
      useImperativeHandle(
        ref,
        () => ({
          play: async (unmute = false) => {
            setIsNearViewport(true);
            const v = videoRef.current;
            if (!v) return;
            if (unmute) {
              v.muted = false;
              v.volume = 1;
            }
            try {
              await v.play();
              setIsPlaying(true);
              setIsMuted(v.muted);
            } catch {
              // Unmuted autoplay blocked by browser policy: fallback to muted playback
              try {
                v.muted = true;
                await v.play();
                setIsPlaying(true);
                setIsMuted(true);
              } catch {
                // Playback prevented until user gesture
              }
            }
          },
          pause: () => {
            const v = videoRef.current;
            if (v && !v.paused) {
              v.pause();
              setIsPlaying(false);
            }
          },
          unmute: () => {
            const v = videoRef.current;
            if (v) {
              v.muted = false;
              v.volume = 1;
              setIsMuted(false);
              if (v.paused) {
                v.play().catch(() => {});
              }
            }
          },
          mute: () => {
            const v = videoRef.current;
            if (v) {
              v.muted = true;
              setIsMuted(true);
            }
          },
          getVideoElement: () => videoRef.current,
        }),
        [],
      );

      const toggleSound = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        const nextMuted = !video.muted;
        video.muted = nextMuted;
        if (!nextMuted) {
          video.volume = 1;
          video.play().catch(() => {});
        }
        setIsMuted(nextMuted);
      }, []);

      const togglePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }, []);

      return (
        <div
          ref={containerRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onClick={togglePlayPause}
          className={cn(
            "relative w-full h-full overflow-hidden bg-black cursor-pointer select-none transform-gpu",
            className,
          )}
        >
          {/* Magnetic Cursor Bubble */}
          <motion.div
            style={{ x, y, opacity }}
            className="pointer-events-none absolute z-30 flex w-fit select-none items-center justify-center gap-2 rounded-full bg-black/80 backdrop-blur-md border border-white/25 px-4 py-2 text-xs font-mono font-bold tracking-wider text-white shadow-2xl -translate-x-1/2 -translate-y-1/2"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-white text-white" /> PAUSE
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-[#E50914] text-[#E50914]" /> PLAY
              </>
            )}
          </motion.div>

          {/* High-Fidelity Video Layer with MediaController */}
          <VideoPlayer style={{ width: "100%", height: "100%", display: "block" }}>
            <VideoPlayerContent
              ref={videoRef}
              src={isNearViewport ? videoSrc : undefined}
              preload="none"
              suppressHydrationWarning
              muted
              playsInline
              loop
              poster={isNearViewport ? poster : undefined}
              slot="media"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={() => {
                if (videoRef.current) setIsMuted(videoRef.current.muted);
              }}
              className="w-full h-full object-cover filter contrast-110 brightness-95 transform-gpu"
              style={{ width: "100%", height: "100%" }}
            >
              <track kind="captions" srcLang="en" label="English" default={false} />
            </VideoPlayerContent>

            {/* Top Editorial Badges */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                <span className="font-mono text-[10px] sm:text-xs text-neutral-300 uppercase tracking-widest font-bold">
                  {hintText}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                  <span>{badgeText}</span>
                </div>

                {/* Audio Toggle Pill */}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={isMuted ? "Unmute showreel audio" : "Mute showreel audio"}
                  className="pointer-events-auto flex items-center gap-2 bg-black/75 hover:bg-[#E50914] backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white transition-all duration-300 hover:scale-105 shadow-xl font-mono text-xs uppercase cursor-pointer"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#E50914]" />
                      <span>UNMUTE</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-green-400" />
                      <span>AUDIO ON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Ambient Gradient Shadow */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-10 opacity-75 group-hover:opacity-100 transition-opacity" />

            {/* Media Chrome Control Bar */}
            <div onClick={(e) => e.stopPropagation()} className="relative z-20">
              <VideoPlayerControlBar className="absolute bottom-0 left-0 right-0 z-20 flex w-full items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <VideoPlayerPlayButton className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent" />
                  <VideoPlayerTimeDisplay className="hidden sm:block font-mono text-xs" />
                </div>

                <VideoPlayerTimeRange className="flex-1 mx-2 sm:mx-4 bg-transparent" />

                <div className="flex items-center gap-2 sm:gap-3">
                  <VideoPlayerMuteButton className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent" />
                  <VideoPlayerFullscreenButton className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent" />
                </div>
              </VideoPlayerControlBar>
            </div>
          </VideoPlayer>
        </div>
      );
    }
  )
);

Skiper67.displayName = "Skiper67";

export default Skiper67;
