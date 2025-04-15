import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystemStore } from '../src/FileSystem';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('FileSystemStore', () => {
  let store: FileSystemStore;
  let tempDir: string;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = path.join(os.tmpdir(), `kss-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    store = new FileSystemStore({ path: tempDir });
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Failed to clean up temp directory:', err);
    }
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
    
    // Verify file is actually removed
    const filePath = path.join(tempDir, 'key-to-remove.json');
    let fileExists = true;
    try {
      await fs.access(filePath);
    } catch (err) {
      fileExists = false;
    }
    expect(fileExists).toBe(false);
  });

  it('should clear all values', async () => {
    await store.set('key1', 'value1');
    await store.set('key2', 'value2');
    
    await store.clear();
    
    expect(await store.get('key1')).toBeNull();
    expect(await store.get('key2')).toBeNull();
    
    // Verify directory is empty (except for system files like .DS_Store on macOS)
    const files = await fs.readdir(tempDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    expect(jsonFiles.length).toBe(0);
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

  it('should sanitize keys for filenames', async () => {
    const unsafeKey = 'unsafe/key:with*invalid?chars';
    await store.set(unsafeKey, 'test-value');
    
    // Verify the value can be retrieved with the original key
    expect(await store.get(unsafeKey)).toBe('test-value');
    
    // Verify the file was created with a sanitized name
    const files = await fs.readdir(tempDir);
    expect(files.some(file => file.includes('unsafe_key_with_invalid_chars'))).toBe(true);
  });

  it('should use default path when none provided', async () => {
    // Clean up previous store to avoid conflicts
    const defaultPath = path.join(process.cwd(), '.kss-store');
    try {
      await fs.rm(defaultPath, { recursive: true, force: true });
    } catch (err) {
      // Ignore if directory doesn't exist
    }
    
    const defaultStore = new FileSystemStore();
    
    // Use store to verify it works
    await defaultStore.set('default-test', 'default-value');
    expect(await defaultStore.get('default-test')).toBe('default-value');
    
    // Verify the file was created in the default location
    const defaultExists = await fs.readdir(defaultPath)
      .then(files => files.some(file => file.includes('default-test')))
      .catch(() => false);
    
    expect(defaultExists).toBe(true);
    
    // Clean up
    try {
      await fs.rm(defaultPath, { recursive: true, force: true });
    } catch (err) {
      console.error('Failed to clean up default store path:', err);
    }
  });
}); 