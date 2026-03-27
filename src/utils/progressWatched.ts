import type { ProgressData, ServerConfig } from '../types';
import { indexedDbStorage } from './indexedDbStorage';
import { STORAGE_KEYS } from './storage';
interface Keys {
  series: string;
  movie: string;
}
export const KEYS_PROCESS: Keys = { series: STORAGE_KEYS.SERIE_PROGRESS, movie: STORAGE_KEYS.MOVIE_PROGRESS };

type ProgressType = 'series' | 'movie';

// ── Buscar ────────────────────────────────────────────────────────────────
export const getProgress = async (
  type: ProgressType,
  profileId: any,
  streamId: string,
  server:ServerConfig
): Promise<ProgressData> => {
  try {
    const Key = `${KEYS_PROCESS[type]}_${server.url}_${profileId}_${streamId}`;
    const data = await indexedDbStorage.get(Key);
    if (!data) return { progress: 0, duration: 0, watched: false, updatedAt: '' };
    return data as ProgressData;
  } catch {
    return { progress: 0, duration: 0, watched: false, updatedAt: '' };
  }
};

export const calcProgressPercent = (progress: number, duration?: number): number => {
  if (!duration || !progress) return 0;
  return Math.min(Math.round((progress / duration) * 100), 100);
};
