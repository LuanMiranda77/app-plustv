import LZString from 'lz-string';
import type { ServerConfig } from '../types';
import { indexedDbStorage } from '../utils/indexedDbStorage';

const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72h

const getServerId = (config: ServerConfig) => `${config.url}|${config.username}`;

const getKey = (config: ServerConfig) => `cache_${getServerId(config)}`;

export const CacheService = {
  // ─────────────────────────────────────────────
  // SALVAR CACHE COMPLETO (compressão)
  // ─────────────────────────────────────────────
  async saveFull(data: any, config: ServerConfig) {
    const key = getKey(config);
    const payload = {
      ...data,
      timestamp: Date.now()
    };

    const compressed = LZString.compress(JSON.stringify(payload));

    await indexedDbStorage.set(key, compressed);

    console.log('💾 Cache FULL salvo:', key);
  },

  // ─────────────────────────────────────────────
  // SALVAR PARCIAL (incremental)
  // ─────────────────────────────────────────────
  async savePartial(data: any, config: ServerConfig) {
    const key = getKey(config);

    const existingCompressed = await indexedDbStorage.get(key);

    let existing = {};

    if (existingCompressed) {
      try {
        existing = JSON.parse(LZString.decompress(String(existingCompressed)));
      } catch {
        existing = {};
      }
    }

    const updated = {
      ...existing,
      ...data,
      timestamp: Date.now()
    };

    const compressed = LZString.compress(JSON.stringify(updated));

    await indexedDbStorage.set(key, compressed);

    console.log('💾 Cache PARCIAL atualizado:', key);
  },

  // ─────────────────────────────────────────────
  // CARREGAR CACHE
  // ─────────────────────────────────────────────
  async load(config: ServerConfig) {
    const key = getKey(config);

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
  async isValid(config: ServerConfig) {
    const cache = await this.load(config);

    if (!cache?.timestamp) return false;

    const age = Date.now() - cache.timestamp;

    const valid = age < CACHE_DURATION;

    console.log(`📦 Cache ${(age / 3600000).toFixed(1)}h → ${valid ? 'VÁLIDO' : 'EXPIRADO'}`);

    return valid;
  },

  // ─────────────────────────────────────────────
  // LIMPAR CACHE
  // ─────────────────────────────────────────────
  async clear(config: ServerConfig) {
    const key = getKey(config);
    await indexedDbStorage.remove(key);
  }
};
