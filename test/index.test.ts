import { KssStore } from "../src";

const storage = new KssStore({
  type: "localStorage",
  options: {
    // options for the storage type
  },
});


storage.set("key", "value");
