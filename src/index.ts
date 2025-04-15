import { IStore, StorageType, StorageOptions } from "./interface";
import { WebStorageStore } from "./WebStorage";

export class KssStore implements IStore {
  private store: IStore | null = null;
  private storePromise: Promise<IStore> | null = null;
  private readonly type: StorageType;
  private readonly options: StorageOptions;

  constructor(config: { type: StorageType; options?: StorageOptions }) {
    this.type = config.type;
    this.options = config.options || {};
    this.initStore();
  }

  private async initStore(): Promise<void> {
    try {
      // Handle web storage types directly without dynamic imports
      if (this.type === 'localStorage' || this.type === 'sessionStorage') {
        this.store = new WebStorageStore({
          storageType: this.type,
          ...this.options
        });
        return;
      }

      // Map storage type to file name for other types
      const typeToFileName: Record<Exclude<StorageType, 'localStorage' | 'sessionStorage'>, string> = {
        IndexedDB: 'IndexedDB',
        MongoDB: 'MongoDB',
        SQLite: 'SQLite',
        FileSystem: 'FileSystem',
        MySQL: 'MySQL',
        PostgreSQL: 'PostgreSQL',
        Redis: 'Redis'
      };

      const fileName = typeToFileName[this.type as Exclude<StorageType, 'localStorage' | 'sessionStorage'>] || this.type;
      
      this.storePromise = import(`./${fileName}`)
        .then((module) => {
          const StoreClass = module.default || module[`${fileName}Store`];
          if (!StoreClass) {
            throw new Error(`Store implementation not found for type ${this.type}`);
          }
          return new StoreClass(this.options);
        });
        
      this.store = await this.storePromise;
    } catch (error) {
      console.error(`Failed to initialize ${this.type} store:`, error);
      throw error;
    }
  }

  private async getStore(): Promise<IStore> {
    if (this.store) {
      return this.store;
    }
    
    if (this.storePromise) {
      return this.storePromise;
    }
    
    throw new Error('Store not initialized');
  }

  async get(key: string): Promise<any> {
    const store = await this.getStore();
    return store.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    const store = await this.getStore();
    return store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore();
    return store.remove(key);
  }

  async clear(): Promise<void> {
    const store = await this.getStore();
    return store.clear();
  }

  async keys(): Promise<string[]> {
    const store = await this.getStore();
    return store.keys();
  }
}

export * from './interface';
export * from './WebStorage';
