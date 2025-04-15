export type StorageType = 
    | 'localStorage' 
    | 'sessionStorage' 
    | 'IndexedDB' 
    | 'MongoDB' 
    | 'SQLite' 
    | 'FileSystem' 
    | 'MySQL' 
    | 'PostgreSQL' 
    | 'Redis';

export interface StorageOptions {
    // Common options
    prefix?: string;
    // Database specific options
    connectionString?: string;
    database?: string;
    collection?: string;
    // File system options
    path?: string;
    // IndexedDB options
    dbName?: string;
    storeName?: string;
    // Any other options
    [key: string]: any;
}

export interface IStore {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}