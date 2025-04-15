import { IStore, StorageOptions } from "./interface";
import { MongoClient, Db, Collection } from 'mongodb';

interface MongoDBOptions extends StorageOptions {
  connectionString: string;
  database: string;
  collection?: string;
}

export class MongoDBStore implements IStore {
  private db: Db | null = null;
  private client: MongoClient | null = null;
  private collection: Collection | null = null;
  private readonly options: MongoDBOptions;
  private connectionPromise: Promise<void> | null = null;

  constructor(options: MongoDBOptions) {
    if (!options.connectionString) {
      throw new Error('MongoDB connection string is required');
    }
    if (!options.database) {
      throw new Error('MongoDB database name is required');
    }

    this.options = {
      ...options,
      collection: options.collection || 'kss_store'
    };
    
    this.connect();
  }

  private async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        this.client = new MongoClient(this.options.connectionString);
        await this.client.connect();
        this.db = this.client.db(this.options.database);
        this.collection = this.db.collection(this.options.collection || 'default_collection');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      }
    })();

    return this.connectionPromise;
  }

  private async getCollection(): Promise<Collection> {
    if (!this.collection) {
      await this.connect();
    }
    
    if (!this.collection) {
      throw new Error('MongoDB collection not initialized');
    }
    
    return this.collection;
  }

  async get(key: string): Promise<any> {
    const collection = await this.getCollection();
    const result = await collection.findOne({ key });
    return result ? result.value : null;
  }

  async set(key: string, value: any): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  async remove(key: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ key });
  }

  async clear(): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteMany({});
  }

  async keys(): Promise<string[]> {
    const collection = await this.getCollection();
    const results = await collection.find({}, { projection: { key: 1, _id: 0 } }).toArray();
    return results.map(item => item.key);
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
      this.connectionPromise = null;
    }
  }
}