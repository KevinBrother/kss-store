import { IStore, StorageOptions } from "./interface";

export class SessionStorageStore implements IStore {
  private prefix: string;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || '';
  }

  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  async get(key: string): Promise<any> {
    const fullKey = this.getFullKey(key);
    const value = sessionStorage.getItem(fullKey);
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
    sessionStorage.setItem(fullKey, valueToStore);
  }

  async remove(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    sessionStorage.removeItem(fullKey);
  }

  async clear(): Promise<void> {
    if (this.prefix) {
      // Only clear items with this prefix
      const keys = await this.keys();
      for (const key of keys) {
        await this.remove(key);
      }
    } else {
      sessionStorage.clear();
    }
  }

  async keys(): Promise<string[]> {
    const allKeys = Object.keys(sessionStorage);
    if (!this.prefix) {
      return allKeys;
    }
    
    const prefixLength = this.prefix.length + 1; // +1 for the colon
    return allKeys
      .filter(key => key.startsWith(`${this.prefix}:`))
      .map(key => key.substring(prefixLength));
  }
} 