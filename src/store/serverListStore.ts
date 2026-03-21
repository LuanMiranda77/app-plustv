import { create } from 'zustand';
import type { ServerConfig } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

export interface ServerEntry extends ServerConfig {
  id: string;
  createdAt: string;
  isActive: boolean;
}

interface ServerListState {
  servers: ServerEntry[];
  activeServerId: string | null;

  loadFromStorage: () => void;
  addServer: (server: ServerConfig) => void;
  updateServer: (id: string, data: Partial<ServerConfig>) => void;
  removeServer: (id: string) => void;
  setActiveServer: (id: string) => void;
  getActiveServer: () => ServerEntry | undefined;
}

export const useServerListStore = create<ServerListState>((set, get) => ({
  servers: [],
  activeServerId: null,

  loadFromStorage: () => {
    const servers = storage.get(STORAGE_KEYS.SERVER_LIST) || [];
    const activeConfig = storage.get(STORAGE_KEYS.SERVER_CONFIG);
    const activeServerId = activeConfig
      ? servers.find(
          (s: ServerEntry) => s.url === activeConfig.url && s.username === activeConfig.username
        )?.id || null
      : null;
    set({ servers, activeServerId });
  },

  addServer: (server: ServerConfig) => {
    const newEntry: ServerEntry = {
      ...server,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isActive: false
    };
    set(state => {
      const servers = [...state.servers, newEntry];
      storage.set(STORAGE_KEYS.SERVER_LIST, servers);
      return { servers };
    });
  },

  updateServer: (id: string, data: Partial<ServerConfig>) => {
    set(state => {
      const servers = state.servers.map(s => (s.id === id ? { ...s, ...data } : s));
      storage.set(STORAGE_KEYS.SERVER_LIST, servers);

      // Se o servidor ativo foi atualizado, atualizar também o SERVER_CONFIG
      if (state.activeServerId === id) {
        const updated = servers.find(s => s.id === id);
        if (updated) {
          const config: ServerConfig = {
            name: updated.name,
            url: updated.url,
            username: updated.username,
            password: updated.password
          };
          storage.set(STORAGE_KEYS.SERVER_CONFIG, config);
        }
      }

      return { servers };
    });
  },

  removeServer: (id: string) => {
    set(state => {
      const servers = state.servers.filter(s => s.id !== id);
      storage.set(STORAGE_KEYS.SERVER_LIST, servers);

      // Se removeu o servidor ativo, limpar config
      if (state.activeServerId === id) {
        storage.remove(STORAGE_KEYS.SERVER_CONFIG);
        return { servers, activeServerId: null };
      }

      return { servers };
    });
  },

  setActiveServer: (id: string) => {
    const server = get().servers.find(s => s.id === id);
    if (!server) return;

    const config: ServerConfig = {
      name: server.name,
      url: server.url,
      username: server.username,
      password: server.password
    };
    storage.set(STORAGE_KEYS.SERVER_CONFIG, config);

    set(state => {
      const servers = state.servers.map(s => ({
        ...s,
        isActive: s.id === id
      }));
      storage.set(STORAGE_KEYS.SERVER_LIST, servers);
      return { servers, activeServerId: id };
    });
  },

  getActiveServer: () => {
    const state = get();
    return state.servers.find(s => s.id === state.activeServerId);
  }
}));
