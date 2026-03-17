import type { WatchHistoryItem } from '../store/watchHistoryStore'
import type { Channel, Movie, Series } from '../types'
import channel_json from './data.json'

export const mockMovies: Movie[] = [
  {
    id: 'm1',
    name: 'A Revolução Digital',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Drama',
    rating: '8.5',
    year: '2023',
    isFavorite: false,
  },
  {
    id: 'm2',
    name: 'Noites de Cinema',
    poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Romance',
    rating: '8.2',
    year: '2023',
    isFavorite: false,
  },
  {
    id: 'm3',
    name: 'Aventura nas Montanhas',
    poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Documentário',
    rating: '8.7',
    year: '2022',
    isFavorite: false,
  },
  {
    id: 'm4',
    name: 'Mistério na Cidade',
    poster: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Thriller',
    rating: '8.4',
    year: '2023',
    isFavorite: false,
  },
  {
    id: 'm5',
    name: 'Comédias de Hoje',
    poster: 'https://images.unsplash.com/photo-1571847497216-fdf41eb8cc19?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Comédia',
    rating: '8.1',
    year: '2023',
    isFavorite: false,
  },
  {
    id: 'm6',
    name: 'Ficção Científica Futurista',
    poster: 'https://images.unsplash.com/photo-1536368469351-cec43e0ba18d?w=300&h=450&fit=crop',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
    category: 'Ficção Científica',
    rating: '8.9',
    year: '2024',
    isFavorite: false,
  },
]

export const mockSeries: Series[] = [
  {
    id: 's1',
    name: 'Intriga no Palácio',
    poster: 'https://images.unsplash.com/photo-1486285935371-a9e8b7ce4ef8?w=300&h=450&fit=crop',
    category: 'Drama',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e1-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    name: 'O Detetive Perdido',
    poster: 'https://images.unsplash.com/photo-1433086487191-f32eb2237a1b?w=300&h=450&fit=crop',
    category: 'Mistério',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e2-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
  {
    id: 's3',
    name: 'Jovens ao Luar',
    poster: 'https://images.unsplash.com/photo-1496265305814-d68d7c12f235?w=300&h=450&fit=crop',
    category: 'Romance',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e3-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
  {
    id: 's4',
    name: 'Expedição Extrema',
    poster: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=450&fit=crop',
    category: 'Ação',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e4-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
  {
    id: 's5',
    name: 'Comédia Familiar',
    poster: 'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=300&h=450&fit=crop',
    category: 'Comédia',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e5-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
  {
    id: 's6',
    name: 'Segredos Escondidos',
    poster: 'https://images.unsplash.com/photo-1462684223066-81342ee5ff30?w=300&h=450&fit=crop',
    category: 'Drama',
    isFavorite: false,
    seasons: [
      {
        number: 1,
        episodes: [
          {
            id: 'e6-1',
            name: 'Episódio 1',
            number: 1,
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x3DevVMNE44lTdRaEWr_4.m3u8',
            watched: false,
          },
        ],
      },
    ],
  },
]

export const mockChannels: any[] = channel_json;

export const mockVodCategories = [
  { id: 'vod1', name: 'Drama' },
  { id: 'vod2', name: 'Romance' },
  { id: 'vod3', name: 'Comédia' },
  { id: 'vod4', name: 'Ação' },
  { id: 'vod5', name: 'Ficção Científica' },
  { id: 'vod6', name: 'Thriller' },
]

export const mockSeriesCategories = [
  { id: 'ser1', name: 'Drama' },
  { id: 'ser2', name: 'Romance' },
  { id: 'ser3', name: 'Comédia' },
  { id: 'ser4', name: 'Ação' },
  { id: 'ser5', name: 'Mistério' },
]

export const mockLiveCategories = [
  { id: 'live1', name: 'Filmes' },
  { id: 'live2', name: 'Séries' },
  { id: 'live3', name: 'Documentários' },
  { id: 'live4', name: 'Comédia' },
  { id: 'live5', name: 'Drama' },
]

// Mock Watch History for "Continue Watching"
export const mockWatchHistory: WatchHistoryItem[] = [
  {
    id: 'm1',
    type: 'movie',
    name: 'A Revolução Digital',
    poster: mockMovies[0].poster,
    progress: 45,
    duration: 7920, // 2h 12m
    watched: 3564, // 59m
    lastWatched: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    content: mockMovies[0],
  },
  {
    id: 's1',
    type: 'series',
    name: 'Intriga no Palácio',
    poster: mockSeries[0].poster,
    progress: 65,
    duration: 3000, // 50m
    watched: 1950, // 32.5m
    lastWatched: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    content: mockSeries[0],
  },
  {
    id: 'm4',
    type: 'movie',
    name: 'Mistério na Cidade',
    poster: mockMovies[3].poster,
    progress: 28,
    duration: 7500, // 2h 5m
    watched: 2100, // 35m
    lastWatched: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    content: mockMovies[3],
  },
  {
    id: 's2',
    type: 'series',
    name: 'O Detetive Perdido',
    poster: mockSeries[1].poster,
    progress: 82,
    duration: 2700, // 45m
    watched: 2214, // 36.9m
    lastWatched: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    content: mockSeries[1],
  },
  {
    id: 'm3',
    type: 'movie',
    name: 'Aventura nas Montanhas',
    poster: mockMovies[2].poster,
    progress: 12,
    duration: 11400, // 3h 10m
    watched: 1368, // 22.8m
    lastWatched: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    content: mockMovies[2],
  },
  {
    id: 'ch2',
    type: 'channel',
    name: 'Séries Populares',
    logo: mockChannels[1].logo,
    progress: 5,
    duration: 3600, // 1h
    watched: 180, // 3m
    lastWatched: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    content: mockChannels[1],
  },
]
