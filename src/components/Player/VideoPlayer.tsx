import { useEffect, useRef, useState } from 'react';
import { useHls } from '../../hooks/useHls';
import { PlayerControls } from './PlayerControls';
import { useProgress } from '../../hooks/useProgress';

interface VideoPlayerProps {
  title: string;
  source: string;
  poster?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onEnded?: () => void;
  isControlsVisible?: boolean;
  streamId: string | number;
  saveInterval?: number;
  isAutoSave?: boolean;
  type: 'movie' | 'series' | 'live';
}

export const VideoPlayer = ({
  isControlsVisible = true,
  title,
  source,
  poster,
  autoPlay = false,
  onError,
  onEnded,
  streamId,
  saveInterval,
  isAutoSave = false,
  type,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { saveNow } = useProgress({
    type: type, // ou 'series' dependendo do contexto
    streamId: String(streamId),
    videoRef,
    saveInterval: saveInterval ?? 5000, // salva a cada 5 segundos
    isAutoSave,
  });

  const { hls, error, isLoading, currentQuality, qualities } = useHls(
    videoRef as React.RefObject<HTMLVideoElement>,
    source
  );

  // Update HLS quality
  const handleQualityChange = (index: number) => {
    if (!hls) return;

    if (index === -1) {
      hls.currentLevel = -1; // Auto
    } else {
      hls.currentLevel = index;
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'KeyF':
          handleFullscreen();
          break;
        case 'KeyM':
          handleMute();
          break;
        case 'ArrowRight':
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(v + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(v - 0.1, 0));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black group"
      style={{ aspectRatio: '16 / 9' }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        autoPlay={autoPlay}
        // controls

        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onVolumeChange={() => {
          if (videoRef.current) {
            setVolume(videoRef.current.volume);
          }
        }}
      />

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">⚠️ Erro</p>
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Player Controls */}
      {isControlsVisible && (
        <PlayerControls
          title={title}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onFullscreen={handleFullscreen}
          isLoading={isLoading}
          qualities={qualities}
          currentQuality={currentQuality}
          onQualityChange={handleQualityChange}
        />
      )}
    </div>
  );
};
