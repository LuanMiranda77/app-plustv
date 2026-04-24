/* eslint-disable react-hooks/set-state-in-effect */
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { formatTimeEpg, safeAtob } from '../../utils/geral';
const placehoder = './placeholde.png';

interface PlayerControlsProps {
  poster: string | undefined;
  title: string;
  isPlaying: boolean;
  showLoader: boolean;
  onPlayPause: () => void;
  onNextEpisode?: () => void;
  onBackEpisode?: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onFullscreen: () => void;
  isLoading?: boolean;
  qualities: string[];
  currentQuality: number;
  onQualityChange?: (index: number) => void;
  remoteActivityTrigger?: number;
  onBack?: () => void;
  type?: 'movie' | 'series' | 'live';
  epgList?: any[];
}

export const PlayerControls = ({
  poster,
  title,
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  onFullscreen,
  isLoading = false,
  qualities,
  currentQuality,
  onQualityChange,
  remoteActivityTrigger = 0,
  onBack,
  type,
  showLoader,
  epgList,
  onNextEpisode,
  onBackEpisode
}: PlayerControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useWindowSize();
  const scheduleHide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    // Esconder após 8 segundos de inatividade quando reproduzindo
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 8000);
  };

  useEffect(() => {
    // Manter controles visíveis enquanto vídeo está rodando
    if (isPlaying) {
      setIsVisible(true);
      scheduleHide();
    } else {
      // Mostrar controles quando pausado
      setIsVisible(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    // Reaparcer controles quando há atividade do controle remoto
    if (remoteActivityTrigger > 0) {
      setIsVisible(true);
      if (isPlaying) {
        scheduleHide();
      }
    }
  }, [remoteActivityTrigger, isPlaying]);

  const handleMouseMove = () => {
    setIsVisible(true);
    if (isPlaying) {
      scheduleHide();
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isControlesVisible = type === 'live' ? (isMobile ? false : false) : true;

  return (
    showLoader && (
      <div
        onMouseMove={handleMouseMove}
        className="absolute inset-0 flex flex-col justify-between group"
      >
        {/* Gradient top */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Title bar */}
        <div
          className={`absolute top-4 left-4 pr-10 w-full flex items-center justify-between gap-2 transition-opacity duration-300 
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <button
            onClick={onBack}
            className="z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl max-md:text-sm transition-colors duration-200 hover:text-red-500"
            title="Voltar"
          >
            <ArrowLeft />
          </button>
          {type != 'live' && <h2 className="text-2xl max-sm:text-lg font-semibold">{title}</h2>}
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-12 h-12 text-red-600 animate-spin" />
          </div>
        )}
        {/* Loading spinner */}
        {type == 'series' && (
          <div
            className={`absolute inset-0 
              flex items-center 
              justify-between 
              w-full px-10 
              ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <button
              onClick={onBackEpisode}
              className="z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl max-md:text-sm transition-colors duration-200 hover:text-red-500"
              title="Voltar episódio"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={onNextEpisode}
              className="z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-2xl max-md:text-sm transition-colors duration-200 hover:text-red-500"
              title="Seguinte episódio"
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Controls bar */}
        {isControlesVisible ? (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress bar */}
            <div className="mb-4 group/progress cursor-pointer relative" style={{ height: '24px' }}>
              <div className="w-full h-1 bg-gray-700 rounded-full hover:h-2 transition-all absolute top-1/2 left-0 -translate-y-1/2 z-10">
                <div
                  className="h-full bg-red-600 rounded-full transition-all relative"
                  style={{ width: `${progressPercent > 100 ? 100 : progressPercent}%` }}
                />
                {/* Bolinha branca acompanha o progresso */}
                <div
                  className="w-4 h-4 bg-red-700 rounded-full shadow-lg absolute top-1/2 -translate-y-1/2 opacity-100 transition-opacity z-20"
                  style={{ left: `calc(${progressPercent > 100 ? 100 : progressPercent}% - 8px)` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={e => onSeek(parseFloat(e.target.value))}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-30"
                style={{ height: '24px' }}
              />
            </div>

            {/* Controls container */}
            <div className="flex items-center justify-between gap-4">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={onPlayPause}
                  className="text-white hover:text-red-600 transition-colors p-2 rounded hover:bg-white/10"
                  title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                    className="text-white hover:text-red-600 transition-colors p-2 rounded hover:bg-white/10"
                    title="Mutar (M)"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 transition-all duration-200 cursor-pointer accent-red-600"
                  />
                </div>

                {/* Time display */}
                <span className="text-white text-sm font-mono ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Quality selector */}
                {qualities.length > 0 && (
                  <select
                    value={currentQuality}
                    onChange={e => onQualityChange?.(parseInt(e.target.value))}
                    className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-red-600 transition-colors"
                  >
                    <option value={-1}>Auto</option>
                    {qualities.map((q, idx) => (
                      <option key={idx} value={idx}>
                        {q}
                      </option>
                    ))}
                  </select>
                )}

                {/* Fullscreen */}
                <button
                  onClick={onFullscreen}
                  className="text-white hover:text-red-600 transition-colors p-2 rounded hover:bg-white/10"
                  title="Tela cheia (F)"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`absolute bottom-0 flex  bg-black/60 w-full ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          >
            <div className="bg-black/40 shrink-0 flex items-center justify-center rounded-l-lg">
              <img
                src={poster}
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-25 h-25 max-md:w-15 max-md:h-15 object-contain p-2"
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling)
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <img
                className="hidden w-25 h-25 max-md:w-15 max-md:h-15 object-contain p-2"
                src={placehoder}
              />
            </div>
            <div className="flex flex-col gap-2 text-left p-3">
              <h2 className="text-3xl max-md:text-md font-semibold">{title}</h2>
              <div className="flex flex-col">
                {epgList?.map(epg => {
                  const startTime = formatTimeEpg(epg.start_timestamp);
                  const endTime = formatTimeEpg(epg.stop_timestamp);
                  const title = safeAtob(epg.title) || safeAtob(epg.name) || 'Sem título';
                  return (
                    <p>
                      {startTime && endTime ? `${startTime} - ${endTime}` : ''} ➜ {title}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};
