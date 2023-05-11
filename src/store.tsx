import {
  syncedStore,
  getYjsDoc,
  SyncedXml,
} from "../node_modules/@syncedstore/core";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "../node_modules/@hocuspocus/provider";

export type Todo = {
  content: SyncedXml;
  completed: boolean;
  modified: string;
  created: string;
  id: string;
};

// Create your SyncedStore store
export const store = syncedStore({ todos: [] as Todo[] });

// Get the Yjs document and sync automatically
const ydoc = getYjsDoc(store);

// Check if IndexedDB is supported
new Promise<IDBDatabase>((resolve) => {
  const request = indexedDB.open("test-" + Math.random());
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => resolve(request.result);
}).then((result) => {
  if (result) {
    //Remove test DB
    indexedDB.deleteDatabase(result.name);

    // Persist to local IndexedDB
    new IndexeddbPersistence("default", ydoc);
    console.log("IndexedDB is supported");
  } else console.warn("IndexedDB not supported");
});

// Connect to remote server and sync
export const provider = new HocuspocusProvider({
  url: "ws://server:1234",
  document: ydoc,
  name: "default",
});

provider.on("status", console.log);
