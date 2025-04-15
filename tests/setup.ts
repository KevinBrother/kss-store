import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

// Setup localStorage and sessionStorage mocks
class StorageMock {
  private items: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.items[key] || null;
  }

  setItem(key: string, value: string): void {
    this.items[key] = value;
  }

  removeItem(key: string): void {
    delete this.items[key];
  }

  clear(): void {
    this.items = {};
  }

  get length(): number {
    return Object.keys(this.items).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.items);
    return keys[index] || null;
  }
}

// Create mock storage objects
const localStorageMock = new StorageMock();
const sessionStorageMock = new StorageMock();

// Define global variables for Node.js environment
if (typeof window === 'undefined') {
  global.localStorage = localStorageMock as unknown as Storage;
  global.sessionStorage = sessionStorageMock as unknown as Storage;
} else {
  // For browser environments (like jsdom)
  if (!window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  }
  if (!window.sessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    });
  }
}

// Setup and teardown for each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
}); 