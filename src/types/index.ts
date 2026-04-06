// Credenciais do servidor
export interface ServerConfig {
  name: string;
  url: string;
  username: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
}

// Perfil de usuário
export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji ou cor hex
  pin?: string;
  createdAt: Date;
}

// Canal de TV ao vivo
export interface Channel {
  id: string; // → número de exibição
  name: string; // → "UFC TV 03"
  streamUrl: string; // → chave para montar a URL    // → chave para montar a URL
  logo: string; // → logo do canal
  category: string; // → para agrupar por categoria
  isFavorite: boolean; // → 1 = tem gravação disponível
}

// Filme
export interface Movie {
  id: string;
  name: string;
  poster: string;
  streamUrl: string;
  category: string;
  rating?: string;
  year: string;
  youtube_trailer?: string;
  genre?: string;
  plot?: string;
  isFavorite: boolean;
  watched: boolean;
  progress: number; // segundos assistidos
  duration: number; // duração total em segundos
  displayDuration?: string; // duração formatada (ex: "1h 30m")
}

// Série
export interface Series {
  id: string;
  name: string;
  poster: string;
  category: string;
  rating?: string;
  plot?: string;
  genre?: string;
  year: string;
  youtube_trailer?: string;
  seasons: Season[];
  isFavorite: boolean;
  loaded: false;
}

export type StreamType = 'series' | 'movie' | 'live';

export interface Season {
  number: number;
  episodes: Episode[];
  cover?: string;
  name?: string;
  airDate?: string;
}

export interface Episode {
  id: string;
  name: string;
  number: number;
  season_number: number;
  streamUrl: string;
  rating?: string;
  thumbnail?: string;
  airDate?: string;
  plot?: string;
  genre?: string;
  year?: string;
  watched: boolean;
  progress: number; // segundos assistidos
  duration: number; // duração total em segundos
  displayDuration?: string; // duração formatada (ex: "1h 30m")
}

export interface ProgressData {
  progress: number;
  duration: number;
  watched: boolean;
  updatedAt: string;
}

// Resposta da API Xtream
export interface XtreamAuthResponse {
  user_info?: {
    username: string;
    password: string;
    status: string;
    exp_date: number;
    isp_friendly_name: string;
    max_connections: number;
  };
  server_info?: {
    url: string;
    port: number;
    https_port: number;
    rtmp_port: number;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

// Tipos das respostas da API Xtream Codes
export interface XtreamLiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string | null;
  added: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  category_id: string | number;
  category_ids: (string | number)[];
  thumbnail: string;
}

export interface XtreamVodStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating?: string;
  year?: string;
  category_id: string | number;
  category_ids: (string | number)[];
  duration?: string;
}

export interface XtreamSeries {
  series_id: number;
  name: string;
  cover: string;
  series_cover?: string;
  category_id: string | number;
  category_ids: (string | number)[];
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  year?: number;
}

export interface XtreamCategory {
  category_id: string | number;
  category_name: string;
}
