# KssStore - Universal Storage Interface

KssStore provides a uniform interface for different storage mechanisms, allowing you to easily switch between storage types while keeping your application code consistent.

## Supported Storage Types

- `localStorage` (default, browser)
- `sessionStorage` (browser)
- `IndexedDB` (browser)
- `MongoDB` (server)
- `SQLite` (server)
- `FileSystem` (server)
- `MySQL` (server)
- `PostgreSQL` (server)
- `Redis` (server)

## Installation

```bash
npm install kss-store
```

For optional database drivers:

```bash
# For MongoDB (already included as a dependency)
# For SQLite
npm install better-sqlite3
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

### localStorage / sessionStorage

```javascript
const storage = new KssStore({
  type: 'localStorage', // or 'sessionStorage'
  options: {
    prefix: 'myapp' // Optional prefix for keys
  }
});
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

## License

MIT
