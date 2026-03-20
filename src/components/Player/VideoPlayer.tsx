import { useEffect, useRef, useState } from 'react';
import { useHls } from '../../hooks/useHls';
import { useProgress } from '../../hooks/useProgress';
import { useRemoteControl } from '../../hooks/useRemotoControl';
import type { Channel, Episode, Movie } from '../../types';
import { PlayerControls } from './PlayerControls';

interface VideoPlayerProps {
  title: string;
  source: string;
  poster?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onEnded?: () => void;
  onNextEpisode?: () => void;
  onBack?: () => void;
  isControlsVisible?: boolean;
  streamId: string | number;
  saveInterval?: number;
  isAutoSave?: boolean;
  type: 'movie' | 'series' | 'live';
  contentObject?: Movie | Episode | Channel | null;
}

export const VideoPlayer = ({
  isControlsVisible = true,
  title,
  source,
  poster,
  autoPlay = false,
  onError,
  onEnded,
  onNextEpisode,
  onBack,
  streamId,
  saveInterval,
  isAutoSave = false,
  type,
  contentObject,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNextEpisodeBtn, setShowNextEpisodeBtn] = useState(false);
  const [remoteActivityTrigger, setRemoteActivityTrigger] = useState(0);
  const { saveNow } = useProgress({
    type: type, // ou 'series' dependendo do contexto
    streamId: String(streamId),
    videoRef,
    saveInterval: saveInterval ?? 5000, // salva a cada 5 segundos
    isAutoSave,
    title,
    poster,
    contentObject,
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

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Remote Control Handler
  useRemoteControl({
    onUp: () => {
      setRemoteActivityTrigger((t) => t + 1);
      setVolume((v) => Math.min(v + 0.1, 1));
    },
    onDown: () => {
      setRemoteActivityTrigger((t) => t + 1);
      setVolume((v) => Math.max(v - 0.1, 0));
    },
    onRight: () => {
      setRemoteActivityTrigger((t) => t + 1);
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
      }
    },
    onLeft: () => {
      setRemoteActivityTrigger((t) => t + 1);
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
      }
    },
    onOk: () => {
      setRemoteActivityTrigger((t) => t + 1);
      handlePlayPause();
    },
    onPlayPause: () => {
      setRemoteActivityTrigger((t) => t + 1);
      handlePlayPause();
    },
    onBack: () => {
      setRemoteActivityTrigger((t) => t + 1);
      if (isFullscreen) {
        handleFullscreen();
      } else {
        onBack?.();
      }
    },
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black group"
      style={{ aspectRatio: '16 / 9' }}
    >
      <video
        ref={videoRef}
        className="w-full h-full z-[999]"
        poster={poster}
        autoPlay={autoPlay}
        // controls

        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const current = videoRef.current.currentTime;
            setCurrentTime(current);
            // Mostrar botão de próximo episódio quando faltar 40 segundos
            if (type === 'series' && duration > 0) {
              const timeRemaining = duration - current;
              if (timeRemaining <= 60 && timeRemaining > 0) {
                setShowNextEpisodeBtn(true);
              }
            }
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          // Auto-avançar para próximo episódio se for série
          if (type === 'series' && onNextEpisode) {
            onNextEpisode();
          } else {
            onEnded?.();
          }
        }}
        onVolumeChange={() => {
          if (videoRef.current) {
            setVolume(videoRef.current.volume);
          }
        }}
      />

      {/* Back Button */}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">⚠️ Erro</p>
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Next Episode Button - Always visible when active */}
      {showNextEpisodeBtn && type === 'series' && onNextEpisode && (
        <div className="absolute bottom-24 right-8 z-[99999]">
          <button
            onClick={() => {
              setShowNextEpisodeBtn(false);
              onNextEpisode();
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
          >
            <span>➤</span>
            <span>Próximo Episódio</span>
          </button>
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
          remoteActivityTrigger={remoteActivityTrigger}
          onBack={onBack}
        />
      )}
    </div>
  );
};
