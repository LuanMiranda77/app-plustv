// src/utils/storage.ts

const KEYS = {
  PROGRESS: 'iptv_episode_progress',
  WATCHED: 'iptv_episode_watched',
};

// Formato salvo:
// { "episodeId": { progress: 1234, duration: 2700, updatedAt: "2026-03-18" } }

export const saveProgress = (episodeId: string, progress: number, duration: number) => {
  const all = getAll();
  all[episodeId] = {
    progress,
    duration,
    updatedAt: new Date().toISOString(),
    // marca como assistido se passou de 90%
    watched: duration > 0 && progress / duration > 0.9,
  };
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
};

export const getProgress = (episodeId: string) => {
  const all = getAll();
  return all[episodeId] ?? { progress: 0, duration: 0, watched: false };
};

export const getAll = (): Record<string, any> => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{}');
  } catch {
    return {};
  }
};

export const markWatched = (episodeId: string, watched: boolean) => {
  const all = getAll();
  all[episodeId] = { ...all[episodeId], watched, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
};
