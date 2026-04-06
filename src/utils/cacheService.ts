import LZString from 'lz-string';
import type { ServerConfig } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';
import { STORAGE_KEYS } from './storage';

const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72h

export type ListType = 'LIST_CHANNELS' | 'LIST_SERIES' | 'LIST_MOVIES';

const getServerId = (config: ServerConfig) => `${config.url}|${config.username}`;

const getKey = (config: ServerConfig, typeList: ListType) =>
  `CACHE_${typeList}_${getServerId(config)}`;

export const CacheService = {
  // ─────────────────────────────────────────────
  // SALVAR CACHE COMPLETO (compressão)
  // ─────────────────────────────────────────────
  async saveCacheList(data: any, config: ServerConfig, typeList: ListType) {
    const key = getKey(config, typeList);
    const payload = {
      ...data,
      timestamp: Date.now()
    };

    const compressed = LZString.compress(JSON.stringify(payload));

    await indexedDbStorage.set(key, compressed);

    console.log('💾 Cache FULL salvo:', key);
  },

  async patchFavoriteInList(
    config: ServerConfig,
    typeList: ListType,
    id: string,
    isFavorite: boolean
  ) {
    const key = getKey(config, typeList);
    const compressed = await indexedDbStorage.get(key);

    if (!compressed) return;

    try {
      const parsed = JSON.parse(LZString.decompress(String(compressed)));
      const listKey =
        typeList === 'LIST_CHANNELS'
          ? 'channels'
          : typeList === 'LIST_MOVIES'
            ? 'movies'
            : 'series';
      const list = Array.isArray(parsed?.[listKey]) ? parsed[listKey] : [];

      parsed[listKey] = list.map((item: any) =>
        String(item.id) === String(id) ? { ...item, isFavorite } : item
      );

      const updatedCompressed = LZString.compress(JSON.stringify(parsed));
      await indexedDbStorage.set(key, updatedCompressed);
    } catch {
      console.error('❌ Erro ao atualizar favorito no cache:', key);
    }
  },
  // ─────────────────────────────────────────────
  // SALVAR CACHE COMPLETO (compressão)
  // ─────────────────────────────────────────────
  // async saveFull(data: any, config: ServerConfig) {
  //   const key = getKey(config);
  //   const payload = {
  //     ...data,
  //     timestamp: Date.now()
  //   };

  //   const compressed = LZString.compress(JSON.stringify(payload));

  //   await indexedDbStorage.set(key, compressed);

  //   console.log('💾 Cache FULL salvo:', key);
  // },

  // ─────────────────────────────────────────────
  // SALVAR PARCIAL (incremental)
  // ─────────────────────────────────────────────
  // async savePartial(data: any, config: ServerConfig) {
  //   const key = getKey(config);

  //   const existingCompressed = await indexedDbStorage.get(key);

  //   let existing = {};

  //   if (existingCompressed) {
  //     try {
  //       existing = JSON.parse(LZString.decompress(String(existingCompressed)));
  //     } catch {
  //       existing = {};
  //     }
  //   }

  //   const updated = {
  //     ...existing,
  //     ...data,
  //     timestamp: Date.now()
  //   };

  //   const compressed = LZString.compress(JSON.stringify(updated));

  //   await indexedDbStorage.set(key, compressed);

  //   console.log('💾 Cache PARCIAL atualizado:', key);
  // },

  // ─────────────────────────────────────────────
  // CARREGAR CACHE
  // ─────────────────────────────────────────────
  async load(config: ServerConfig, typeList: ListType) {
    const key = getKey(config, typeList || 'LIST_CHANNELS');

    const compressed = await indexedDbStorage.get(key);

    if (!compressed) return null;

    try {
      const parsed = JSON.parse(LZString.decompress(String(compressed)));

      console.log('📦 Cache carregado:', key);

      return parsed;
    } catch {
      console.error('❌ Erro ao descomprimir cache');
      return null;
    }
  },

  // ─────────────────────────────────────────────
  // VALIDAR CACHE
  // ─────────────────────────────────────────────
  async isValid(config: ServerConfig, typeList: ListType) {
    const cache = await this.load(config, typeList);

    if (!cache?.timestamp) return false;

    const age = Date.now() - cache.timestamp;

    const valid = age < CACHE_DURATION;

    console.log(`📦 Cache ${(age / 3600000).toFixed(1)}h → ${valid ? 'VÁLIDO' : 'EXPIRADO'}`);

    return valid;
  },

  // ─────────────────────────────────────────────
  // LIMPAR CACHE
  // ─────────────────────────────────────────────
  async clear(config: ServerConfig, typeList?: ListType) {
    const key = getKey(config, typeList || 'LIST_CHANNELS');
    await indexedDbStorage.remove(key);

    const prefixEpisodes = `${STORAGE_KEYS.LIST_EPISODES}_${config.url}`;
    indexedDbStorage.getKeysByPrefix(prefixEpisodes).then(keys => {
      keys.forEach(k => indexedDbStorage.remove(k));
    });

    const prefixMovieProgress = `${STORAGE_KEYS.MOVIE_PROGRESS}_${config.url}`;
    indexedDbStorage.getKeysByPrefix(prefixMovieProgress).then(keys => {
      keys.forEach(k => indexedDbStorage.remove(k));
    });

    const prefixSerieProgress = `${STORAGE_KEYS.SERIE_PROGRESS}_${config.url}`;
    indexedDbStorage.getKeysByPrefix(prefixSerieProgress).then(keys => {
      keys.forEach(k => indexedDbStorage.remove(k));
    });
    console.log('🧹 Cache limpo:', key);
  }
};
