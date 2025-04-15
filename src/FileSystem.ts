import { IStore, StorageOptions } from "./interface";
import * as fs from 'fs/promises';
import * as path from 'path';


interface FileSystemOptions extends StorageOptions {
  path?: string;
}

export class FileSystemStore implements IStore {
  private readonly storagePath: string;
  private initialized: boolean = false;

  constructor(options: FileSystemOptions = {}) {
    this.storagePath = options.path || path.join(process.cwd(), '.kss-store');
    this.init();
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FileSystemStore:', error);
      throw error;
    }
  }

  private getFilePath(key: string): string {
    // Sanitize the key to make it a valid filename
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.storagePath, `${sanitizedKey}.json`);
  }

  async get(key: string): Promise<any> {
    await this.init();
    const filePath = this.getFilePath(key);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data).value;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.init();
    const filePath = this.getFilePath(key);
    const data = {
      key,
      value,
      updatedAt: new Date()
    };
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async remove(key: string): Promise<void> {
    await this.init();
    const filePath = this.getFilePath(key);
    
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    await this.init();
    
    const files = await fs.readdir(this.storagePath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(this.storagePath, file));
      }
    }
  }

  async keys(): Promise<string[]> {
    await this.init();
    
    const files = await fs.readdir(this.storagePath);
    return files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.slice(0, -5)); // Remove .json extension
  }
} 