import { HocuspocusProvider } from "@hocuspocus/provider";
import { getYjsDoc, syncedStore } from "@syncedstore/core";
import { IndexeddbPersistence } from "y-indexeddb";
import { XmlFragment } from "yjs";

export type Todo = {
  content: XmlFragment;
  completed: boolean;
  modified: number;
  created: number;
  id: string;
};

export const store = syncedStore({ todos: [] as Todo[] });

// Get/create the Yjs document and sync automatically
const ydoc = getYjsDoc(store);

// Check if IndexedDB is supported, then sync
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
  url: "wss://tasks-server.nicholaslyz.com",
  document: ydoc,
  name: "default",
});
