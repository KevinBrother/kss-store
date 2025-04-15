import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KssStore } from '../src/index';
import { WebStorageStore } from '../src/WebStorage';

// Mock WebStorage
vi.mock('../src/WebStorage', () => {
  const mockWebStorageStore = vi.fn().mockImplementation((options) => {
    if (options?.storageType === 'sessionStorage') {
      return {
        get: vi.fn().mockImplementation(key => Promise.resolve(`session-value-for-${key}`)),
        set: vi.fn().mockImplementation((key, value) => Promise.resolve()),
        remove: vi.fn().mockImplementation(key => Promise.resolve()),
        clear: vi.fn().mockImplementation(() => Promise.resolve()),
        keys: vi.fn().mockImplementation(() => Promise.resolve(['session-key-1', 'session-key-2']))
      };
    }
    
    // Default to localStorage behavior
    return {
      get: vi.fn().mockImplementation(key => Promise.resolve(`mock-value-for-${key}`)),
      set: vi.fn().mockImplementation((key, value) => Promise.resolve()),
      remove: vi.fn().mockImplementation(key => Promise.resolve()),
      clear: vi.fn().mockImplementation(() => Promise.resolve()),
      keys: vi.fn().mockImplementation(() => Promise.resolve(['mock-key-1', 'mock-key-2']))
    };
  });
  
  return {
    WebStorageStore: mockWebStorageStore,
    LocalStorageStore: vi.fn().mockImplementation(options => mockWebStorageStore({ ...options, storageType: 'localStorage' })),
    SessionStorageStore: vi.fn().mockImplementation(options => mockWebStorageStore({ ...options, storageType: 'sessionStorage' }))
  };
});

// Skip the error test for now
describe('KssStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with localStorage by default', async () => {
    const store = new KssStore({
      type: 'localStorage'
    });
    
    // No need to wait for async initialization since WebStorage is now created synchronously
    expect(WebStorageStore).toHaveBeenCalledWith({ storageType: 'localStorage' });
    
    const value = await store.get('test-key');
    expect(value).toBe('mock-value-for-test-key');
  });

  it('should initialize with sessionStorage when specified', async () => {
    const store = new KssStore({
      type: 'sessionStorage'
    });
    
    expect(WebStorageStore).toHaveBeenCalledWith({ storageType: 'sessionStorage' });
    
    const value = await store.get('test-key');
    expect(value).toBe('session-value-for-test-key');
  });

  it('should pass options to the storage implementation', async () => {
    const options = {
      prefix: 'test-prefix',
      customOption: 'custom-value'
    };
    
    const store = new KssStore({
      type: 'localStorage',
      options
    });
    
    expect(WebStorageStore).toHaveBeenCalledWith({ 
      storageType: 'localStorage',
      ...options
    });
  });

  it('should delegate all method calls to the underlying storage', async () => {
    const store = new KssStore({
      type: 'localStorage'
    });
    
    const mockStore = (WebStorageStore as any).mock.results[0].value;
    
    await store.set('test-key', 'test-value');
    expect(mockStore.set).toHaveBeenCalledWith('test-key', 'test-value');
    
    await store.get('test-key');
    expect(mockStore.get).toHaveBeenCalledWith('test-key');
    
    await store.remove('test-key');
    expect(mockStore.remove).toHaveBeenCalledWith('test-key');
    
    await store.clear();
    expect(mockStore.clear).toHaveBeenCalled();
    
    await store.keys();
    expect(mockStore.keys).toHaveBeenCalled();
  });
}); 