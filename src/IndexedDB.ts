import { IStore, StorageOptions } from "./interface";

interface IndexedDBOptions extends StorageOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
}

export class IndexedDBStore implements IStore {
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly version: number;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDBOptions = {}) {
    this.dbName = options.dbName || 'kss-store';
    this.storeName = options.storeName || 'kss-data';
    this.version = options.version || 1;
    this.open();
  }

  private open(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error}`));
      };
    });

    return this.dbPromise;
  }

  private getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    return this.open().then(db => {
      const transaction = db.transaction(this.storeName, mode);
      return transaction.objectStore(this.storeName);
    });
  }

  async get(key: string): Promise<any> {
    const store = await this.getStore();
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const record = request.result;
        resolve(record ? record.value : null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async set(key: string, value: any): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const record = { key, value, updatedAt: new Date() };
      const request = store.put(record);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async keys(): Promise<string[]> {
    const store = await this.getStore();
    return new Promise((resolve, reject) => {
      const keys: string[] = [];
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          keys.push(cursor.value.key);
          cursor.continue();
        } else {
          resolve(keys);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}
