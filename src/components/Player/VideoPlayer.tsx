/* eslint-disable react-hooks/immutability */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useHls } from '../../hooks/useHls';
import { useProgress } from '../../hooks/useProgress';
import { useRemoteControl } from '../../hooks/useRemotoControl';
import type { Channel, Episode, Movie, Series } from '../../types';
import NextEpisodeButton from './NextEpisodeButton';
import PlayerLoader from './PlaerLoader';
import { PlayerControls } from './PlayerControls';
import PlayerError from './PlayerError';
import useWindowSize from '../../hooks/useWindowSize';

interface VideoPlayerProps {
  title: string;
  source: string;
  poster?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onEnded?: () => void;
  onNextEpisode?: () => void;
  onBackEpisode?: () => void;
  onBack?: () => void;
  onRefreshSource?: () => string | Promise<string>;
  isControlsVisible?: boolean;
  streamId: string | number;
  saveInterval?: number;
  isAutoSave?: boolean;
  type: 'movie' | 'series' | 'live';
  contentObject?: Movie | Episode | Channel | null;
  parentContent?: Series | null;
  nextEpisode?: Episode | null;
  currentSeason?: number;
  epgList?: any[];
}

export const VideoPlayer = ({
  isControlsVisible = true,
  title,
  source: initialSource,
  poster,
  autoPlay = false,
  onError,
  onEnded,
  onNextEpisode,
  onBackEpisode,
  onBack,
  onRefreshSource,
  streamId,
  saveInterval,
  isAutoSave = false,
  type,
  contentObject,
  parentContent,
  nextEpisode,
  currentSeason = 1,
  epgList
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNextEpisodeBtn, setShowNextEpisodeBtn] = useState(false);
  const [remoteActivityTrigger, setRemoteActivityTrigger] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSource, setCurrentSource] = useState(initialSource);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useWindowSize();

  const timeRemaining = duration > 0 ? Math.floor(duration - currentTime) : 0;

  const { saveNow } = useProgress({
    type,
    streamId: String(streamId),
    videoRef,
    saveInterval: saveInterval ?? 5000,
    isAutoSave,
    title,
    poster,
    contentObject,
    parentContent
  });

  const handleTokenExpired = useCallback(async () => {
    console.log('Token expirado, tentando renovar...');
    if (onRefreshSource) {
      try {
        const newSource = await onRefreshSource();
        if (newSource) {
          setCurrentSource(newSource);
          setReconnectAttempt(0);
          return;
        }
      } catch (err) {
        console.error('Erro ao renovar token:', err);
      }
    }
    // Se não tem função de refresh, tenta reconectar com o mesmo source
    handleReconnect();
  }, [onRefreshSource]);

  const {
    hls,
    error: hlsError,
    isLoading: hlsLoading,
    currentQuality,
    qualities,
    reconnect
  } = useHls(videoRef as React.RefObject<HTMLVideoElement>, currentSource, {
    onTokenExpired: handleTokenExpired
  });

  // Combinar erros
  // const error = hlsError;
  const isLoading = hlsLoading;

  // Não mostrar loader ao adiantar (seek manual)
  const [isSeeking, setIsSeeking] = useState(false);
  const timeNextButton = 60; // segundos para mostrar botão de próximo episódio

  // Handler para detectar seek manual
  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    setIsSeeking(true);
    videoRef.current.currentTime = time;
    setTimeout(() => setIsSeeking(false), 800); // tempo para esconder loader após seek
  };

  const showLoader = (isLoading || (isBuffering && !isSeeking) || !hasStarted) && !hlsError;

  const handleQualityChange = (index: number) => {
    if (!hls) return;
    hls.currentLevel = index === -1 ? -1 : index;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Erro ao reproduzir:', err);
        onError?.('Não foi possível reproduzir o stream');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
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

  const handleReconnect = useCallback(() => {
    if (reconnectAttempt >= 3) {
      onError?.('Falha ao reconectar após múltiplas tentativas. Verifique sua conexão.');
      return;
    }

    setReconnectAttempt(prev => prev + 1);
    console.log(`Tentativa de reconexão ${reconnectAttempt + 1}/3`);

    if (reconnect) {
      reconnect();
    } else if (videoRef.current && currentSource) {
      // Recarregar o source
      videoRef.current.src = currentSource;
      videoRef.current.load();
      if (autoPlay) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [reconnectAttempt, reconnect, currentSource, autoPlay, onError]);

  // Efeito para tentar reconectar quando houver erro
  useEffect(() => {
    if (hlsError && type === 'live' && reconnectAttempt < 3) {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        handleReconnect();
      }, 3000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [hlsError, type, reconnectAttempt, handleReconnect]);

  useEffect(() => {
    if (hlsError) {
      onError?.(hlsError);
    }
  }, [hlsError, onError]);

  // Reset ao trocar source (novo episódio)
  useEffect(() => {
    setHasStarted(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setShowNextEpisodeBtn(false);
    setReconnectAttempt(0);
  }, [currentSource]);

  // Atualizar source quando initialSource mudar
  useEffect(() => {
    if (initialSource !== currentSource) {
      setCurrentSource(initialSource);
    }
  }, [initialSource]);

  useRemoteControl(
    {
      onUp: () => {
        setRemoteActivityTrigger(t => t + 1);
        setVolume(v => Math.min(v + 0.1, 1));
        if (videoRef.current) {
          videoRef.current.volume = Math.min(videoRef.current.volume + 0.1, 1);
        }
      },
      onDown: () => {
        setRemoteActivityTrigger(t => t + 1);
        setVolume(v => Math.max(v - 0.1, 0));
        if (videoRef.current) {
          videoRef.current.volume = Math.max(videoRef.current.volume - 0.1, 0);
        }
      },
      onRight: () => {
        setRemoteActivityTrigger(t => t + 1);
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
        }
      },
      onLeft: () => {
        setRemoteActivityTrigger(t => t + 1);
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
        }
      },
      onOk: () => {
        setRemoteActivityTrigger(t => t + 1);
        handlePlayPause();
      },
      onPlayPause: () => {
        setRemoteActivityTrigger(t => t + 1);
        handlePlayPause();
      },
      onBack: () => {
        setRemoteActivityTrigger(t => t + 1);
        if (isFullscreen) {
          handleFullscreen();
        } else {
          onBack?.();
        }
      }
    },
    type === 'live'
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black group ${isMobile && 'h-screen'}`}
      style={{ aspectRatio: isMobile ? undefined : '16 / 9' }}
    >
      {/* ── Video ────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        className="w-full h-full z-[999]"
        poster={!hasStarted ? poster : undefined}
        autoPlay={autoPlay}
        playsInline
        onPlay={() => {
          setIsPlaying(true);
          setHasStarted(true);
          setIsBuffering(false);
        }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setHasStarted(true);
        }}
        onCanPlay={() => setIsBuffering(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const current = videoRef.current.currentTime;
            setCurrentTime(current);
            // Mostrar botão quando faltar 30 segundos
            if (type === 'series' && duration > 0 && onNextEpisode) {
              const remaining = duration - current;
              if (remaining <= timeNextButton && remaining > 0 && !showNextEpisodeBtn) {
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
          setShowNextEpisodeBtn(false);
          // Avançar automaticamente ao terminar
          if (type === 'series' && onNextEpisode) {
            onNextEpisode();
          } else {
            onEnded?.();
          }
        }}
        onVolumeChange={() => {
          if (videoRef.current) setVolume(videoRef.current.volume);
        }}
      />

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {showLoader && <PlayerLoader title={title} poster={poster} />}

      {/* ── Erro ──────────────────────────────────────────────────────────── */}
      {hlsError && (
        <PlayerError
          error={hlsError}
          onRetry={handleReconnect}
          retryCount={reconnectAttempt}
          maxRetries={3}
        />
      )}

      {/* ── Próximo Episódio ──────────────────────────────────────────────── */}
      {showNextEpisodeBtn && type === 'series' && onNextEpisode && (
        <div className="absolute bottom-24 right-8 z-99999">
          <NextEpisodeButton
            episodeName={nextEpisode?.name}
            episodeNumber={nextEpisode?.number}
            seasonNumber={currentSeason}
            timeRemaining={timeRemaining}
            autoPlayDelay={30}
            onNext={() => {
              setShowNextEpisodeBtn(false);
              onNextEpisode();
            }}
            onDismiss={() => {
              setShowNextEpisodeBtn(false);
              onBack?.();
            }}
          />
        </div>
      )}

      {/* ── Controles ─────────────────────────────────────────────────────── */}
      {isControlsVisible && (
        <PlayerControls
          poster={poster}
          title={type === 'series' ? `${parentContent?.name}`:title}
          subtitle={type === 'series' ? `${title.replaceAll(parentContent?.name+" - ", "")}` : ""}
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
          type={type}
          showLoader={!showLoader}
          epgList={epgList}
          onNextEpisode={onNextEpisode}
          onBackEpisode={onBackEpisode}
        />
      )}
    </div>
  );
};
