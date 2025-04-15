import { IStore, StorageOptions } from "./interface";

export type WebStorageType = 'localStorage' | 'sessionStorage';

interface WebStorageOptions extends StorageOptions {
  storageType?: WebStorageType;
  prefix?: string;
}

// Safe access to storage API
const getStorage = (type: WebStorageType = 'localStorage'): Storage => {
  // Browser environment
  if (typeof window !== 'undefined') {
    return type === 'sessionStorage' ? window.sessionStorage : window.localStorage;
  }
  
  // Node.js environment
  try {
    return type === 'sessionStorage' ? global.sessionStorage : global.localStorage;
  } catch (e) {
    throw new Error(`${type} is not available in this environment`);
  }
};

export class WebStorageStore implements IStore {
  private prefix: string;
  private storage: Storage;

  constructor(options: WebStorageOptions = {}) {
    this.prefix = options.prefix || '';
    try {
      // Use the specified storage type or default to localStorage
      this.storage = getStorage(options.storageType);
    } catch (error) {
      console.error(`Failed to initialize WebStorageStore:`, error);
      // Create mock storage for environments without localStorage/sessionStorage
      this.storage = createMockStorage();
    }
  }

  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get(key: string): Promise<any> {
    const fullKey = this.getFullKey(key);
    const value = this.storage.getItem(fullKey);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const fullKey = this.getFullKey(key);
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    this.storage.setItem(fullKey, valueToStore);
  }

  async remove(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    this.storage.removeItem(fullKey);
  }

  async clear(): Promise<void> {
    if (this.prefix) {
      // Only clear items with this prefix
      const keys = await this.keys();
      for (const key of keys) {
        await this.remove(key);
      }
    } else {
      this.storage.clear();
    }
  }

  async keys(): Promise<string[]> {
    const allKeys = Object.keys(this.storage);
    if (!this.prefix) {
      return allKeys;
    }
    
    const prefixLength = this.prefix.length + 1; // +1 for the colon
    return allKeys
      .filter(key => key.startsWith(`${this.prefix}:`))
      .map(key => key.substring(prefixLength));
  }
}

// Create a mock storage for environments without localStorage/sessionStorage
function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    clear: (): void => { Object.keys(store).forEach(key => delete store[key]); },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
    [Symbol.iterator]: function* () {
      yield* Object.entries(store);
    }
  } as unknown as Storage;
}

// Export aliases for backward compatibility
export class LocalStorageStore extends WebStorageStore {
  constructor(options: StorageOptions = {}) {
    super({ ...options, storageType: 'localStorage' });
  }
}

export class SessionStorageStore extends WebStorageStore {
  constructor(options: StorageOptions = {}) {
    super({ ...options, storageType: 'sessionStorage' });
  }
} 