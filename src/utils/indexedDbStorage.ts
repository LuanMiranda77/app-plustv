// IndexedDB para armazenar grandes quantidades de dados (até 50MB+)
const DB_NAME = 'IPTV_APP_DB';
const STORE_NAME = 'playlist_cache';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = async () => {
      dbInstance = request.result;
      console.log('✅ IndexedDB inicializado com sucesso');
      // const cached = await indexedDbStorage.get('playlist_cache');
      // const json = JSON.stringify(cached);
      // const bytes = new Blob([json]).size;

      // const channels = JSON.stringify(cached.channels);
      // const movies = JSON.stringify(cached.movies);
      // const series = JSON.stringify(cached.series);

      // console.table({
      //   total: `${(bytes / 1024 / 1024).toFixed(2)}MB`,
      //   channels: `${(new Blob([channels]).size / 1024 / 1024).toFixed(2)}MB`,
      //   movies: `${(new Blob([movies]).size / 1024 / 1024).toFixed(2)}MB`,
      //   series: `${(new Blob([series]).size / 1024 / 1024).toFixed(2)}MB`
      // });
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Criar object store se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        console.log('📦 Object store criado');
      }
    };
  });
};

export const indexedDbStorage = {
  async get(key: string) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            console.log(`📖 Dados lidos do IndexedDB [${key}]:`, {
              tamanho: JSON.stringify(result.value).length,
            });
            resolve(result.value);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error(`❌ Erro ao ler IndexedDB [${key}]:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erro ao inicializar IndexedDB:', error);
      return null;
    }
  },

  async set(key: string, value: any) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const dataSize = JSON.stringify(value).length;
        const sizeInMB = (dataSize / 1024 / 1024).toFixed(2);

        console.log(`📝 Salvando no IndexedDB [${key}]:`, {
          tamanho: `${dataSize} bytes (${sizeInMB}MB)`,
        });

        const request = store.put({ key, value });

        request.onsuccess = () => {
          console.log(`✅ Salvo com sucesso no IndexedDB! [${key}]`);
          resolve(true);
        };

        request.onerror = () => {
          console.error(`❌ Erro ao salvar no IndexedDB [${key}]:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erro ao salvar no IndexedDB:', error);
      throw error;
    }
  },

  async remove(key: string) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => {
          console.log(`🗑️ Removido do IndexedDB: ${key}`);
          resolve(true);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erro ao remover do IndexedDB:', error);
      throw error;
    }
  },

  async clear() {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('🧹 IndexedDB limpo');
          resolve(true);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erro ao limpar IndexedDB:', error);
      throw error;
    }
  },
};
