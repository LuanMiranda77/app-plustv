import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { isTV, getOptimalVideoSize } from '../utils/deviceDetection';

type Props = {
  source: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  bufferConfig?: {
    minBufferTime?: number;
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
  };
};

export default function VideoPlayer({ 
  source, 
  poster, 
  autoPlay = true, 
  controls = true, 
  preload = 'metadata',
  bufferConfig = {}
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const optimalSize = getOptimalVideoSize();

  // Para web (incluindo TVs LG webOS)
  if (Platform.OS === 'web') {
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Detectar se é um stream HLS (.m3u8)
      if (source.includes('.m3u8')) {
        // Verificar se o navegador suporta HLS nativamente
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          // Usar hls.js para navegadores que não suportam HLS nativamente
          import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls({
                // Configurações de buffer otimizadas para performance
                maxBufferLength: bufferConfig.maxBufferLength || 30, // 30s de buffer
                maxMaxBufferLength: bufferConfig.maxMaxBufferLength || 60, // máximo 60s
                maxBufferSize: 60 * 1000 * 1000, // 60MB
                maxBufferHole: 0.5, // preenche buracos de 0.5s
                
                // Configurações de fragmento para carregamento eficiente
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 3,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 3,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
                
                // Otimizações de qualidade adaptativa
                startLevel: -1, // auto-select inicial
                capLevelToPlayerSize: true, // adapta qualidade ao tamanho do player
                
                // Configurações de low latency
                liveBackBufferLength: 10,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
                
                // Configurações de debugging (pode remover em produção)
                debug: false,
                enableWorker: true, // usa web worker para melhor performance
              });
              
              hls.loadSource(source);
              hls.attachMedia(video);
              
              // Event listeners para monitorar performance
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest carregado');
              });
              
              hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
                // console.log(`Fragmento carregado: ${data.frag.url}`);
              });
              
              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                  } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                  }
                }
              });
              
              // Limpar recursos quando componente desmonta
              return () => {
                hls.destroy();
              };
            }
          });
        }
      } else {
        // Para outros formatos (mp4, etc.)
        video.src = source;
      }
    }, [source, bufferConfig]);

    return (
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        preload={preload}
        crossOrigin="anonymous"
        style={{ 
          width: optimalSize.width, 
          height: optimalSize.height, 
          backgroundColor: 'black',
          maxWidth: '100%',
        }}
        // Otimizações HTML5
        playsInline
        webkit-playsinline="true"
        // Otimizações específicas para TV
        x-webkit-airplay="allow"
      />
    );
  }

  // Para mobile, use react-native-video
  const Video = require('react-native-video').default;
  return (
    <Video
      source={{ uri: source }}
      poster={poster}
      controls={controls}
      paused={!autoPlay}
      resizeMode="contain"
      style={{ 
        width: optimalSize.width, 
        height: optimalSize.height, 
        backgroundColor: 'black',
        maxWidth: '100%',
      }}
      // Configurações específicas para melhor suporte HLS no mobile
      useNativeControls={true}
      ignoreSilentSwitch="ignore"
      
      // Configurações de buffer para melhor performance
      bufferConfig={{
        minBufferMs: bufferConfig.minBufferTime || 15000, // 15s mínimo
        maxBufferMs: bufferConfig.maxBufferLength || 50000, // 50s máximo
        bufferForPlaybackMs: 2500, // 2.5s para iniciar playback
        bufferForPlaybackAfterRebufferMs: 5000, // 5s após rebuffer
        backBufferDurationMs: 120000, // manter 2min de buffer anterior
      }}
      
      // Configurações de rede otimizadas
      maxBitRate={2000000} // 2Mbps máximo para economizar dados
      reportBandwidth={true}
      
      // Configurações de qualidade adaptativa
      selectedVideoTrack={{
        type: 'auto', // seleção automática de qualidade
      }}
      
      // Otimizações de performance
      playInBackground={false} // não reproduz em background para economizar bateria
      playWhenInactive={false}
      preventsDisplaySleepDuringVideoPlayback={true}
      
      // Event handlers para monitorar performance
      onLoad={(data: any) => {
        console.log('Vídeo carregado:', data);
      }}
      onLoadStart={() => {
        console.log('Iniciando carregamento...');
      }}
      onBuffer={(data: any) => {
        console.log('Buffering:', data.isBuffering);
      }}
      onProgress={(data: any) => {
        // console.log('Progress:', data.currentTime);
      }}
      onError={(error: any) => {
        console.error('Erro no vídeo:', error);
      }}
    />
  );
}