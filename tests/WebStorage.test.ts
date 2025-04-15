import { describe, it, expect, beforeEach } from 'vitest';
import { WebStorageStore, LocalStorageStore, SessionStorageStore } from '../src/WebStorage';

describe('WebStorageStore', () => {
  describe('localStorage', () => {
    let store: WebStorageStore;

    beforeEach(() => {
      localStorage.clear();
      store = new WebStorageStore({ storageType: 'localStorage' });
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
  });

  describe('sessionStorage', () => {
    let store: WebStorageStore;

    beforeEach(() => {
      sessionStorage.clear();
      store = new WebStorageStore({ storageType: 'sessionStorage' });
    });

    it('should store and retrieve values', async () => {
      // Test string values
      await store.set('string-key', 'string-value');
      expect(await store.get('string-key')).toBe('string-value');

      // Test object values
      const testObject = { name: 'Test', value: 123 };
      await store.set('object-key', testObject);
      expect(await store.get('object-key')).toEqual(testObject);
    });

    it('should remove values', async () => {
      await store.set('key-to-remove', 'value');
      expect(await store.get('key-to-remove')).toBe('value');
      
      await store.remove('key-to-remove');
      expect(await store.get('key-to-remove')).toBeNull();
    });
  });

  describe('LocalStorageStore (alias)', () => {
    let store: LocalStorageStore;

    beforeEach(() => {
      localStorage.clear();
      store = new LocalStorageStore();
    });

    it('should be an instance of WebStorageStore', () => {
      expect(store).toBeInstanceOf(WebStorageStore);
    });

    it('should store and retrieve values', async () => {
      await store.set('alias-test', 'alias-value');
      expect(await store.get('alias-test')).toBe('alias-value');
    });
  });

  describe('SessionStorageStore (alias)', () => {
    let store: SessionStorageStore;

    beforeEach(() => {
      sessionStorage.clear();
      store = new SessionStorageStore();
    });

    it('should be an instance of WebStorageStore', () => {
      expect(store).toBeInstanceOf(WebStorageStore);
    });

    it('should store and retrieve values', async () => {
      await store.set('alias-test', 'alias-value');
      expect(await store.get('alias-test')).toBe('alias-value');
    });
  });
}); 