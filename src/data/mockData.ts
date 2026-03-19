import type { WatchHistoryItem } from '../store/watchHistoryStore';
import channel_json from './channel_ex.json';

export const mockChannels: any[] = channel_json;

export const mockVodCategories = [
  { id: 'vod1', name: 'Drama' },
  { id: 'vod2', name: 'Romance' },
  { id: 'vod3', name: 'Comédia' },
  { id: 'vod4', name: 'Ação' },
  { id: 'vod5', name: 'Ficção Científica' },
  { id: 'vod6', name: 'Thriller' },
];

export const mockSeriesCategories = [
  { id: 'ser1', name: 'Drama' },
  { id: 'ser2', name: 'Romance' },
  { id: 'ser3', name: 'Comédia' },
  { id: 'ser4', name: 'Ação' },
  { id: 'ser5', name: 'Mistério' },
];

export const mockLiveCategories = [
  { id: 'live1', name: 'Filmes' },
  { id: 'live2', name: 'Séries' },
  { id: 'live3', name: 'Documentários' },
  { id: 'live4', name: 'Comédia' },
  { id: 'live5', name: 'Drama' },
];

