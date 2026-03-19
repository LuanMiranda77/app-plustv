/* eslint-disable react-hooks/preserve-manual-memoization */
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import type { ProgressData } from '../types';
import { KEYS_PROCESS } from '../utils/progressWatched';

interface UseProgressProps {
  type: 'movie' | 'series' | 'live';
  streamId: string;
  videoRef: React.RefObject<HTMLVideoElement> | any;
  saveInterval?: number;
  isAutoSave?: boolean;
}

export const useProgress = ({
  type,
  streamId,
  videoRef,
  saveInterval = 5000,
  isAutoSave = false,
}: UseProgressProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { activeProfile } = useAuthStore();

  // Chave única por perfil + tipo + stream
  const Key = `${KEYS_PROCESS[type]}_${activeProfile?.id}_${streamId}`;

  // ── Salvar ────────────────────────────────────────────────────────────────
  const saveProgress = useCallback(
    async (progress: number, duration: number) => {
      const data: ProgressData = {
        progress,
        duration,
        updatedAt: new Date().toISOString(),
        watched: duration > 0 && progress / duration > 0.9,
      };
      try {
        await indexedDbStorage.set(Key, data);
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error);
      }
    },
    [streamId, activeProfile?.id, type]
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
          updatedAt: new Date().toISOString(),
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
