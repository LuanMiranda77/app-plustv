/* eslint-disable react-hooks/preserve-manual-memoization */
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { useWatchHistoryStore } from '../store/watchHistoryStore';
import type { Channel, Episode, Movie, ProgressData, Series } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { KEYS_PROCESS } from '../utils/progressWatched';

interface UseProgressProps {
  type: 'movie' | 'series' | 'live';
  streamId: string;
  videoRef: React.RefObject<HTMLVideoElement> | any;
  saveInterval?: number;
  isAutoSave?: boolean;
  title?: string;
  poster?: string;
  contentObject?: Movie | Episode | Channel | null;
  parentContent?: Series | null;
}

export const useProgress = ({
  type,
  streamId,
  videoRef,
  saveInterval = 10000,
  isAutoSave = false,
  title,
  poster,
  contentObject,
  parentContent
}: UseProgressProps) => {
  const intervalRef = useRef<any | null>(null);
  const hasAddedToHistory = useRef(false);
  const { activeProfile } = useAuthStore();
  const { addToHistory } = useWatchHistoryStore();
  const { movies, series, channels } = useContentStore();
  const { serverConfig } = useAuthStore();

  // Chave única por perfil + tipo + stream
  const Key = `${(KEYS_PROCESS as any)[type]}_${activeProfile?.id}_${streamId}`;

  // ── Salvar ────────────────────────────────────────────────────────────────
  const saveProgress = useCallback(
    async (progress: number, duration: number) => {
      const data: ProgressData = {
        progress,
        duration,
        updatedAt: new Date().toISOString(),
        watched: duration > 0 && progress / duration > 0.9
      };
      try {
        await indexedDbStorage.set(Key, data);

        // Adicionar ao histórico se passou 1 minuto (60 segundos)
        // Apenas para filmes e séries, não para live
        if (progress > 60 && !hasAddedToHistory.current && type !== 'live') {
          hasAddedToHistory.current = true;

          // Encontrar conteúdo baseado no streamId e tipo
          let content: any = null;
          let name = title || `${type} ${streamId}`;
          let itemPoster = poster || '';

          if (type === 'movie') {
            content = movies.find(m => m.id === streamId) || contentObject;
            if (content && 'name' in content) {
              name = content.name;
              itemPoster = content.poster || itemPoster;
            }
          } else if (type === 'series') {
            // Para séries: top-level = dados da série, content = episódio
            const parentSeries = parentContent || series.find(s => s.id === streamId);
            if (parentSeries) {
              name = parentSeries.name;
              itemPoster = parentSeries.poster || itemPoster;
              // content é o episódio (contentObject)
              content = contentObject;
            } else {
              content = contentObject;
              if (content && 'name' in content) {
                name = content.name;
                itemPoster = (content as any).poster || itemPoster;
              }
            }

            if (content) {
              addToHistory(
                {
                  id: parentSeries?.id || streamId,
                  type: 'series',
                  name,
                  poster: itemPoster,
                  progress: Math.round((progress / duration) * 100),
                  duration: Math.floor(duration),
                  watched: progress,
                  lastWatched: new Date(),
                  content
                },
                serverConfig!
              );
              console.log(`📝 Adicionado ao histórico-Serie: ${name}`);
            }
            return;
          }

          // Adicionar ao histórico apenas se encontrou o conteúdo (movie)
          if (content) {
            addToHistory(
              {
                id: streamId,
                type: type as 'movie' | 'series',
                name,
                poster: itemPoster,
                progress: Math.round((progress / duration) * 100),
                duration: Math.floor(duration),
                watched: progress,
                lastWatched: new Date(),
                content
              },
              serverConfig!
            );
            console.log(`📝 Adicionado ao histórico-Filme: ${name}`);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error);
      }
    },
    [
      streamId,
      activeProfile?.id,
      type,
      title,
      poster,
      contentObject,
      parentContent,
      movies,
      series,
      channels,
      addToHistory
    ]
  );

  // ── Buscar ────────────────────────────────────────────────────────────────
  const getProgress = useCallback(async (): Promise<ProgressData> => {
    try {
      const data = await indexedDbStorage.get(Key);
      if (!data) return { progress: 0, duration: 0, watched: false, updatedAt: '' };
      return data as ProgressData;
    } catch {
      return { progress: 0, duration: 0, watched: false, updatedAt: '' };
    }
  }, [streamId, activeProfile?.id, type]);

  // ── Marcar como assistido ─────────────────────────────────────────────────
  const markWatched = useCallback(
    async (watched: boolean) => {
      try {
        const current = await getProgress();
        await indexedDbStorage.set(Key, {
          ...current,
          watched,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Erro ao marcar assistido:', error);
      }
    },
    [streamId, activeProfile?.id, type]
  );

  // ── Restaurar progresso ao carregar vídeo ─────────────────────────────────
  const restoreProgress = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const { progress } = await getProgress();
    if (progress > 10) {
      video.currentTime = progress;
      console.log(`▶️ Retomando em ${Math.floor(progress / 60)}m${progress % 60}s`);
    }
  }, [streamId, videoRef, activeProfile?.id]);

  // ── Salvar agora (pausa / desmonta) ───────────────────────────────────────
  const saveNow = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.currentTime) return;
    await saveProgress(Math.floor(video.currentTime), Math.floor(video.duration || 0));
  }, [videoRef, saveProgress]);

  // ── Iniciar intervalo de auto-save ────────────────────────────────────────
  const startSaving = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) return;
      await saveProgress(Math.floor(video.currentTime), Math.floor(video.duration || 0));
    }, saveInterval);
  }, [videoRef, saveProgress, saveInterval]);

  const stopSaving = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Resetar hasAddedToHistory ao mudar de stream ───────────────────────────
  useEffect(() => {
    hasAddedToHistory.current = false;
  }, [streamId]);

  // ── Eventos do vídeo ──────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (isAutoSave && !video) return;

    const onLoaded = () => restoreProgress();
    const onPlay = () => startSaving();
    const onPause = () => saveNow();
    const onEnded = async () => {
      stopSaving();
      await saveNow();
      await markWatched(true);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      saveNow(); // salva ao trocar episódio / fechar player
      stopSaving();
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [streamId, activeProfile?.id]); // re-registra se mudar episódio ou perfil

  return { saveNow, restoreProgress, getProgress, markWatched };
};
