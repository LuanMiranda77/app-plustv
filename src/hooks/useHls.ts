/* eslint-disable react-hooks/set-state-in-effect */
import Hls from 'hls.js';
import { useEffect, useState } from 'react';

interface UseHlsOptions {
  autoPlay?: boolean;
  bufferConfig?: {
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
  };
}

interface UseHlsReturn {
  hls: Hls | null;
  error: string | null;
  isLoading: boolean;
  currentQuality: number;
  qualities: string[];
}

export const useHls = (
  videoRef: React.RefObject<HTMLVideoElement>,
  source: string,
  options: UseHlsOptions = {}
): UseHlsReturn => {
  const [hls, setHls] = useState<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [qualities, setQualities] = useState<string[]>([]);

  useEffect(() => {
    if (!videoRef.current || !source) return;

    const video = videoRef.current;

    // Clear previous error when loading new source
    setError(null);

    // Detectar se é HLS
    if (!source.includes('.m3u8') && !source.includes('.mp4')) {
      setError('Formato de stream não suportado');
      return;
    }

    // Para MP4, usar src direto
    if (source.includes('.mp4')) {
      video.src = source;
      setIsLoading(false);
      return;
    }

    // Para HLS
    if (Hls.isSupported()) {
      const hlsInstance = new Hls({
        maxBufferLength: options.bufferConfig?.maxBufferLength || 30,
        maxMaxBufferLength: options.bufferConfig?.maxMaxBufferLength || 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        startLevel: -1,
        capLevelToPlayerSize: true,
        liveBackBufferLength: 10,
        enableWorker: true,
      });

      // Carregar source
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      // Event listeners
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        // Extrair quality levels
        const levels = hlsInstance.levels.map(
          (level) => `${level.height}p (${Math.round(level.bitrate / 1000)}k)`
        );
        setQualities(levels);
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentQuality(data.level);
      });

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setError('Erro de rede. Tentando reconectar...');
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setError('Erro de mídia');
            hlsInstance.recoverMediaError();
          }
        }
      });

      setHls(hlsInstance);

      // Cleanup
      return () => {
        hlsInstance.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari suporta HLS nativo
      video.src = source;
      setIsLoading(false);
    } else {
      setError('Seu navegador não suporta HLS');
    }
  }, [source, videoRef]);

  return { hls, error, isLoading, currentQuality, qualities };
};
