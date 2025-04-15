import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoDBStore } from '../src/MongoDB';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('MongoDBStore', () => {
  let mongoServer: MongoMemoryServer;
  let store: MongoDBStore;
  let connectionString: string;
  
  // Start MongoDB memory server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    connectionString = mongoServer.getUri();
  });

  // Stop MongoDB memory server
  afterAll(async () => {
    if (store) {
      await store.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Create a fresh store instance before each test
  beforeEach(async () => {
    if (store) {
      await store.close();
    }
    
    store = new MongoDBStore({
      connectionString,
      database: 'kss-test-db',
      collection: 'kss-test-collection'
    });
    
    // Clear existing data
    await store.clear();
  });

  it('should store and retrieve values', async () => {
    // Test string values
    await store.set('string-key', 'string-value');
    expect(await store.get('string-key')).toBe('string-value');

    // Test object values
    const testObject = { name: 'Test', value: 123 };
    await store.set('object-key', testObject);
    expect(await store.get('object-key')).toEqual(testObject);

    // Test array values
    const testArray = [1, 2, 3, 'test'];
    await store.set('array-key', testArray);
    expect(await store.get('array-key')).toEqual(testArray);

    // Test number values
    await store.set('number-key', 12345);
    expect(await store.get('number-key')).toBe(12345);
  });

  it('should return null for non-existent keys', async () => {
    expect(await store.get('non-existent')).toBeNull();
  });

  it('should remove values', async () => {
    await store.set('key-to-remove', 'value');
    expect(await store.get('key-to-remove')).toBe('value');
    
    await store.remove('key-to-remove');
    expect(await store.get('key-to-remove')).toBeNull();
  });

  it('should clear all values', async () => {
    await store.set('key1', 'value1');
    await store.set('key2', 'value2');
    
    await store.clear();
    
    expect(await store.get('key1')).toBeNull();
    expect(await store.get('key2')).toBeNull();
  });

  it('should list all keys', async () => {
    await store.set('key1', 'value1');
    await store.set('key2', 'value2');
    await store.set('key3', 'value3');
    
    const keys = await store.keys();
    expect(keys).toHaveLength(3);
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys).toContain('key3');
  });

  it('should throw error when connectionString is not provided', async () => {
    expect(() => new MongoDBStore({
      database: 'test-db'
    } as any)).toThrow('MongoDB connection string is required');
  });

  it('should throw error when database is not provided', async () => {
    expect(() => new MongoDBStore({
      connectionString: 'mongodb://localhost:27017'
    } as any)).toThrow('MongoDB database name is required');
  });

  it('should use default collection name when not provided', async () => {
    const storeWithDefaultCollection = new MongoDBStore({
      connectionString,
      database: 'kss-test-db'
    });
    
    await storeWithDefaultCollection.set('test-key', 'test-value');
    expect(await storeWithDefaultCollection.get('test-key')).toBe('test-value');
    
    // Clean up
    await storeWithDefaultCollection.clear();
    await storeWithDefaultCollection.close();
  });
}); 