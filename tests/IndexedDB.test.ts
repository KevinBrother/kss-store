import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBStore } from "../src/IndexedDB";

describe("IndexedDBStore", () => {
  let store: IndexedDBStore;
  const dbName = "test-kss-store-db";
  const storeName = "test-kss-store";

  beforeEach(async () => {
    store = new IndexedDBStore({
      dbName,
      storeName,
      version: 1,
    });
    // Wait for the db to open
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    await store.close();
  });

  it("should store and retrieve values", async () => {
    // Test string values
    await store.set("string-key", "string-value");
    expect(await store.get("string-key")).toBe("string-value");

    // Test object values
    const testObject = { name: "Test", value: 123 };
    await store.set("object-key", testObject);
    expect(await store.get("object-key")).toEqual(testObject);

    // Test array values
    const testArray = [1, 2, 3, "test"];
    await store.set("array-key", testArray);
    expect(await store.get("array-key")).toEqual(testArray);

    // Test number values
    await store.set("number-key", 12345);
    expect(await store.get("number-key")).toBe(12345);
  });

  it("should return null for non-existent keys", async () => {
    expect(await store.get("non-existent")).toBeNull();
  });

  it("should remove values", async () => {
    await store.set("key-to-remove", "value");
    expect(await store.get("key-to-remove")).toBe("value");

    await store.remove("key-to-remove");
    expect(await store.get("key-to-remove")).toBeNull();
  });

  it("should clear all values", async () => {
    await store.set("key1", "value1");
    await store.set("key2", "value2");

    await store.clear();

    expect(await store.get("key1")).toBeNull();
    expect(await store.get("key2")).toBeNull();
  });

  it("should list all keys", async () => {
    await store.set("key1", "value1");
    await store.set("key2", "value2");
    await store.set("key3", "value3");

    const keys = await store.keys();
    expect(keys).toHaveLength(3);
    expect(keys).toContain("key1");
    expect(keys).toContain("key2");
    expect(keys).toContain("key3");
  });

  it("should use default options when none provided", async () => {
    // Clean up previous store
    await store.close();

    // Create store with default options
    const defaultStore = new IndexedDBStore();

    // Use it to ensure it works
    await defaultStore.set("default-key", "default-value");
    expect(await defaultStore.get("default-key")).toBe("default-value");

    // Clean up
    await defaultStore.close();
  });

  it("should handle upgrading database version", async () => {
    // Close and delete existing DB
    await store.close();

    // Create with version 1
    const storeV1 = new IndexedDBStore({
      dbName,
      storeName,
      version: 1,
    });

    // Add some data
    await storeV1.set("v1-key", "v1-value");

    // Close v1 store
    await storeV1.close();

    // Create with version 2
    const storeV2 = new IndexedDBStore({
      dbName,
      storeName,
      version: 2,
    });

    // Data should still be accessible
    expect(await storeV2.get("v1-key")).toBe("v1-value");

    // Clean up
    await storeV2.close();
  });
});
