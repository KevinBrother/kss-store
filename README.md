# KssStore - Universal Storage Interface

KssStore provides a uniform interface for different storage mechanisms, allowing you to easily switch between storage types while keeping your application code consistent.

## Supported Storage Types

- [x] `localStorage` (default, browser)
- [x] `sessionStorage` (browser)
- [x] `IndexedDB` (browser)
- [x] `MongoDB` (server)
- [x] `FileSystem` (server)

- [ ] `MySQL` (server)
- [ ] `SQLite` (server)
- [ ] `PostgreSQL` (server)
- [ ] `Redis` (server)

## Installation

```bash
npm install kss-store
```

For optional database drivers:

```bash
# For MongoDB (already included as a dependency)
# For MySQL
npm install mysql2
# For PostgreSQL
npm install pg
# For Redis
npm install redis
```

## Basic Usage

```javascript
import { KssStore } from 'kss-store';

// Create a storage instance with the desired type
const storage = new KssStore({
  type: 'localStorage', // Default storage type
  options: {
    // Options specific to the storage type
    prefix: 'myapp' // Optional key prefix for localStorage/sessionStorage
  }
});

// Use the storage API
await storage.set('user', { id: 1, name: 'John' });
const user = await storage.get('user');
console.log(user); // { id: 1, name: 'John' }

const allKeys = await storage.keys();
console.log(allKeys); // ['user']

await storage.remove('user');
console.log(await storage.get('user')); // null

await storage.clear(); // Clear all stored items
```

## Storage-Specific Configuration

### Web Storage (localStorage / sessionStorage)

Both localStorage and sessionStorage are implemented using a unified WebStorage adapter with identical API - only the storage mechanism differs:

```javascript
// Using localStorage
const localStorage = new KssStore({
  type: 'localStorage',
  options: {
    prefix: 'myapp' // Optional prefix for keys
  }
});

// Using sessionStorage
const sessionStorage = new KssStore({
  type: 'sessionStorage',
  options: {
    prefix: 'myapp' // Optional prefix for keys
  }
});

// Direct access to storage implementations
import { WebStorageStore, LocalStorageStore, SessionStorageStore } from 'kss-store';

// Unified adapter that can be configured for either localStorage or sessionStorage
const webStorage = new WebStorageStore({ 
  storageType: 'localStorage', // or 'sessionStorage'
  prefix: 'myapp'
});

// Aliases for backward compatibility
const localStorage = new LocalStorageStore({ prefix: 'myapp' });
const sessionStorage = new SessionStorageStore({ prefix: 'myapp' });
```

### IndexedDB

```javascript
const storage = new KssStore({
  type: 'IndexedDB',
  options: {
    dbName: 'myAppDB', // Database name, default: 'kss-store'
    storeName: 'myData', // Store name, default: 'kss-data'
    version: 1 // Database version, default: 1
  }
});
```

### MongoDB

```javascript
const storage = new KssStore({
  type: 'MongoDB',
  options: {
    connectionString: 'mongodb://localhost:27017',
    database: 'mydb',
    collection: 'kss_store' // default: 'kss_store'
  }
});
```

### File System (Node.js)

```javascript
const storage = new KssStore({
  type: 'FileSystem',
  options: {
    path: './data' // Storage directory, default: process.cwd() + '/.kss-store'
  }
});
```

## API

All storage implementations support the following async methods:

- `get(key: string): Promise<any>` - Retrieve a value
- `set(key: string, value: any): Promise<void>` - Store a value
- `remove(key: string): Promise<void>` - Remove a value
- `clear(): Promise<void>` - Clear all values
- `keys(): Promise<string[]>` - Get all keys

## Development

### Running Tests

The project uses Vitest for testing. Each storage implementation has its own test suite.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test environments are set up automatically:

- Browser storage (localStorage, sessionStorage) uses DOM mocks
- IndexedDB uses the fake-indexeddb library
- MongoDB uses mongodb-memory-server for in-memory testing
- FileSystem creates temporary directories for testing

### Publishing to npm

The package includes scripts to simplify the publishing process:

```bash
# Before publishing, you should:
# 1. Update version in package.json
# 2. Ensure tests pass and build succeeds

# Perform a dry run to check what would be published
npm run release:dry

# Publish a new version to npm
npm run release

# Publish a beta version
npm run release:beta
```

For first-time publishers:

1. Create an npm account if you don't have one: `npm adduser`
2. Login to npm: `npm login`
3. Update repository info in package.json
4. Set the package version (for first release use `1.0.0`)
5. Run `npm run release`

### Implementing a New Storage Adapter

To add a new storage adapter:

1. Create a new file in `src/` named after your storage type
2. Implement the `IStore` interface
3. Add your storage type to the `StorageType` type in `interface.ts`
4. Create tests in `tests/` to verify your implementation

## License

MIT
