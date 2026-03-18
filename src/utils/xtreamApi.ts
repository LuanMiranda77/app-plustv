import axios from 'axios';
import type { ServerConfig, XtreamAuthResponse } from '../types';

const api = axios.create();

// Remover a barra final da URL se existir
const normalizeUrl = (url: string) => url.replace(/\/$/, '');

export const xtreamApi = {
  // Testar conexão e autenticar
  async authenticate(config: ServerConfig): Promise<XtreamAuthResponse> {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
        },
        timeout: 10000,
      });

      if (!response.data || response.status !== 200) {
        throw new Error('Credenciais inválidas');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Conexão expirou. Verifique a URL do servidor.');
        }
        if (error.response?.status === 401) {
          throw new Error('Usuário ou senha incorretos');
        }
        throw new Error(error.message || 'Erro ao conectar ao servidor');
      }
      throw error;
    }
  },

  // Obter categorias de live TV
  async getLiveCategories(config: ServerConfig) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
          action: 'get_live_categories',
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter categorias live:', error);
      return [];
    }
  },

  // Obter canais ao vivo de uma categoria
  async getLiveStreams(config: ServerConfig, categoryId: string) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
          action: 'get_live_streams',
          category_id: categoryId,
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter canais live:', error);
      return [];
    }
  },

  // Obter categorias de VOD (filmes)
  async getVodCategories(config: ServerConfig) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
          action: 'get_vod_categories',
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter categorias VOD:', error);
      return [];
    }
  },

  // Obter filmes de uma categoria
  async getVodStreams(config: ServerConfig, categoryId: string) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
          action: 'get_vod_streams',
          category_id: categoryId,
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter filmes:', error);
      return [];
    }
  },

  // Obter categorias de séries
  async getSeriesCategories(config: ServerConfig) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params: {
          username: config.username,
          password: config.password,
          action: 'get_series_categories',
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter categorias de séries:', error);
      return [];
    }
  },

  // Obter séries de uma categoria
  async getSeries(config: ServerConfig, categoryId?: string) {
    try {
      const baseUrl = normalizeUrl(config.url);
      const params: any = {
        username: config.username,
        password: config.password,
        action: 'get_series',
      };
      if (categoryId) {
        params.category_id = categoryId;
      }
      const response = await api.get(`${baseUrl}/player_api.php`, {
        params,
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Erro ao obter séries:', error);
      return [];
    }
  },

  // Construir URL de stream usando o tipo de stream (live, movie, series)
  buildStreamUrl(
    baseUrl: string,
    username: string,
    password: string,
    streamId: string | number,
    streamType: string = 'live'
  ): string {
    const url = normalizeUrl(baseUrl);
    const id = String(streamId);

    switch (streamType) {
      case 'live':
        return `${url}/live/${username}/${password}/${id}.m3u8`;

      case 'movie':
      case 'video':
        return `${url}/movie/${username}/${password}/${id}.mp4`;

      case 'series':
        return `${url}/series/${username}/${password}/${id}.m3u8`;

      default:
        return `${url}/live/${username}/${password}/${id}.m3u8`;
    }
  },

  // Obter todas as categorias e streams
  async getAllContent(config: ServerConfig) {
    try {
      const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
        this.getLiveCategories(config),
        this.getVodCategories(config),
        this.getSeriesCategories(config),
      ]);

      // Buscar streams de cada categoria
      const liveStreams: any[] = [];
      const vodStreams: any[] = [];
      const seriesStreams: any[] = [];

      // Buscar live streams de cada categoria
      if (Array.isArray(liveCategories)) {
        for (const category of liveCategories) {
          const streams = await this.getLiveStreams(config, category.category_id);
          if (Array.isArray(streams)) {
            liveStreams.push(...streams);
          }
        }
      }

      // Buscar VOD streams de cada categoria
      if (Array.isArray(vodCategories)) {
        for (const category of vodCategories) {
          const streams = await this.getVodStreams(config, category.category_id);
          if (Array.isArray(streams)) {
            vodStreams.push(...streams);
          }
        }
      }

      // Buscar séries de cada categoria
      if (Array.isArray(seriesCategories)) {
        for (const category of seriesCategories) {
          const streams = await this.getSeries(config, category.category_id);
          if (Array.isArray(streams)) {
            seriesStreams.push(...streams);
          }
        }
      }

      return {
        liveCategories: Array.isArray(liveCategories) ? liveCategories : [],
        vodCategories: Array.isArray(vodCategories) ? vodCategories : [],
        seriesCategories: Array.isArray(seriesCategories) ? seriesCategories : [],
        liveStreams,
        vodStreams,
        seriesStreams,
      };
    } catch (error) {
      console.error('Erro ao obter conteúdo:', error);
      return {
        liveCategories: [],
        vodCategories: [],
        seriesCategories: [],
        liveStreams: [],
        vodStreams: [],
        seriesStreams: [],
      };
    }
  },
};
