import { HocuspocusProvider } from "@hocuspocus/provider";
import { getYjsDoc, syncedStore } from "@syncedstore/core";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { XmlFragment } from "yjs";
import { generateKeys } from "./util";
import { User } from "./App";

export type Todo = {
  content: XmlFragment;
  completed: boolean;
  modified: number;
  by?: User;
  created: number;
  id: string;
  sortOrder: string;
};

export const store = syncedStore({ todos: [] as Todo[] });

// Get/create the Yjs document and sync automatically
const ydoc = getYjsDoc(store);

// Connect to remote server and sync
export const provider = new HocuspocusProvider({
  url: "wss://tasks-server.nicholaslyz.com",
  document: ydoc,
  name: "default",
});

/**
 * Force a rerender when store changes.
 * 
 * Uses a debounce for performance.
 */
export const useSyncedStore = () => {
  const [, forceUpdate] = useState<object>();

  /* Some downsides to this method:
  - UI updates are delayed (mitigated somewhat by leading=true)
  - whole component rerenders on updates (albeit debounced)
  */
  useEffect(() => {
    const onUpdate = debounce(() => forceUpdate({}), 500, {
      maxWait: 500,
      leading: true,
    });

    ydoc.on("update", onUpdate);
    return () => ydoc.off("update", onUpdate);
  }, []);

  return store;
};

// Generate keys for the store, only on first run
ydoc.once("update", () => generateKeys(store.todos));

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
