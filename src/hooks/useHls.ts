/* eslint-disable no-dupe-else-if */
/* eslint-disable react-hooks/set-state-in-effect */
import Hls from 'hls.js';
import { useEffect, useState, useRef } from 'react';

interface UseHlsOptions {
  autoPlay?: boolean;
  bufferConfig?: {
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
  };
  onTokenExpired?: () => void;
}

interface UseHlsReturn {
  hls: Hls | null;
  error: string | null;
  isLoading: boolean;
  currentQuality: number;
  qualities: string[];
  reconnect: () => void;
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
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSourceRef = useRef<string>('');

  const reconnect = () => {
    if (!videoRef.current || !source) return;

    console.log('Tentando reconectar...');
    setError(null);
    setIsLoading(true);

    const video = videoRef.current;
    const newSource = source.includes('?')
      ? `${source}&_reconnect=${Date.now()}`
      : `${source}?_reconnect=${Date.now()}`;

    if (source.includes('.ts')) {
      video.src = newSource;
      video.load();
    } else if (source.includes('.m3u8') && hls) {
      hls.destroy();
      const newHls = new Hls();
      newHls.loadSource(newSource);
      newHls.attachMedia(video);
      setHls(newHls);
    }
  };

  const retryLoad = (video: HTMLVideoElement, src: string) => {
    if (retryCountRef.current >= 3) {
      setError('Falha ao carregar stream após múltiplas tentativas. Verifique sua conexão.');
      setIsLoading(false);
      return;
    }

    retryCountRef.current++;
    console.log(`Tentativa de reconexão ${retryCountRef.current}/3...`);
    setError(`Reconectando... tentativa ${retryCountRef.current}/3`);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current) return;

      const newSrc = src.includes('?')
        ? `${src}&_retry=${Date.now()}`
        : `${src}?_retry=${Date.now()}`;

      if (src.includes('.ts')) {
        video.src = newSrc;
        video.load();
      } else if (src.includes('.m3u8') && Hls.isSupported()) {
        const newHls = new Hls();
        newHls.loadSource(newSrc);
        newHls.attachMedia(video);
        setHls(newHls);
      }
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (!videoRef.current || !source) return;

    // Se a source não mudou, não recarrega
    if (lastSourceRef.current === source && !error) {
      return;
    }

    lastSourceRef.current = source;
    const video = videoRef.current;
    retryCountRef.current = 0;

    // Limpar timeouts anteriores
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Destruir HLS anterior se existir
    if (hls) {
      hls.destroy();
      setHls(null);
    }

    setError(null);
    setIsLoading(true);
    setQualities([]);
    setCurrentQuality(-1);

    // Suporte para streams .ts (canais ao vivo com token)
    if (source.includes('.ts')) {
      console.log('Detectado stream .ts, usando reprodução direta');

      // Remover event listeners antigos
      video.oncanplay = null;
      video.onerror = null;
      video.onstalled = null;
      video.onloadstart = null;
      video.onloadeddata = null;

      video.src = source;
      video.load();

      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.log('Timeout no carregamento do stream');
          retryLoad(video, source);
        }
      }, 10000);

      video.onloadstart = () => {
        console.log('Iniciando carregamento do stream...');
      };

      video.onloadeddata = () => {
        console.log('Dados do stream carregados');
        clearTimeout(timeoutId);
        setIsLoading(false);
        setError(null);
      };

      video.oncanplay = () => {
        console.log('Stream pronto para reproduzir');
        clearTimeout(timeoutId);
        setIsLoading(false);
        setError(null);
      };

      video.onerror = e => {
        clearTimeout(timeoutId);
        const mediaError = video.error;
        console.error('Erro no vídeo:', mediaError);

        if (mediaError) {
          // Verificar se é erro de token expirado (geralmente 401, 403 ou rede)
          const errorMessage = mediaError.message || '';
          if (
            errorMessage.includes('401') ||
            errorMessage.includes('403') ||
            mediaError.code === 2 ||
            mediaError.code === 3
          ) {
            setError('Token expirado ou erro de autenticação. Tentando renovar...');
            if (options.onTokenExpired) {
              options.onTokenExpired();
            } else {
              retryLoad(video, source);
            }
          } else if (mediaError.code === 2) {
            setError('Erro de rede. Reconectando...');
            retryLoad(video, source);
          } else if (mediaError.code === 3) {
            setError('Erro de decodificação. Tentando recuperar...');
            retryLoad(video, source);
          } else {
            setError(`Erro ao reproduzir: ${mediaError.message || 'Falha no stream'}`);
          }
        }
      };

      video.onstalled = () => {
        console.log('Stream travado, tentando recuperar...');
        setError('Stream travado. Recuperando...');
        retryLoad(video, source);
      };

      video.onwaiting = () => {
        console.log('Stream em buffer...');
        setIsLoading(true);
      };

      return () => {
        clearTimeout(timeoutId);
        video.oncanplay = null;
        video.onerror = null;
        video.onstalled = null;
        video.onloadstart = null;
        video.onloadeddata = null;
        video.onwaiting = null;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }

    // Detectar se é HLS (.m3u8)
    if (source.includes('.m3u8')) {
      console.log('Detectado stream HLS .m3u8');

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
          liveSyncDurationCount: 3
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_event:any, data) => {
          console.log('Manifesto HLS carregado');
          setIsLoading(false);
          const levels = hlsInstance.levels.map(
            level => `${level.height}p (${Math.round(level.bitrate / 1000)}k)`
          );
          setQualities(levels);
        });

        hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentQuality(data.level);
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          console.error('HLS Error:', data);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Erro de rede. Tentando reconectar...');
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Erro de mídia. Tentando recuperar...');
                hlsInstance.recoverMediaError();
                break;
              default:
                setError('Erro fatal no stream');
                break;
            }
          } else {
            // Erro não fatal, apenas log
            console.warn('Erro não fatal HLS:', data);
          }
        });

        setHls(hlsInstance);

        return () => {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Usando HLS nativo do Safari');
        video.src = source;
        setIsLoading(false);
      } else {
        setError('Seu navegador não suporta reprodução HLS');
        setIsLoading(false);
      }
      return;
    }

    // Para MP4
    if (source.includes('.mp4')) {
      console.log('Detectado stream MP4');
      video.src = source;

      video.oncanplay = () => {
        setIsLoading(false);
      };

      video.onerror = () => {
        setError('Erro ao carregar vídeo MP4');
        setIsLoading(false);
      };

      setIsLoading(false);
      return;
    }

    // Se chegou aqui, formato não reconhecido
    const extension = source.split('.').pop()?.split('?')[0] || 'desconhecido';
    setError(`Formato de stream não suportado: ${extension}`);
    setIsLoading(false);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [source, videoRef]);

  return { hls, error, isLoading, currentQuality, qualities, reconnect };
};
