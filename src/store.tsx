import { HocuspocusProvider } from "@hocuspocus/provider";
import { notifications } from "@mantine/notifications";
import { getYjsDoc, observeDeep, syncedStore } from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { IndexeddbPersistence } from "y-indexeddb";
import { XmlFragment } from "yjs";
import { User } from "./App";
import { DOCUMENT_NAME } from "./constants";

export type Todo = {
  content: XmlFragment;
  completed: boolean;
  modified: number;

  /**UserID */
  by?: string;
  created: number;
  id: string;
  sortOrder: string;
};

/** The master copy is stored in localStorage, and changes
 * are synced to this object via useUser. Values could be undefined
 * if store is in the progress of updating. */
export type UserData = {
  user?: User;
  /** The last time the user was non-idle.
   * Updated even if the user was offline.
   */
  lastActive?: number;
};

export type Store = {
  todos: Todo[];
  storedUsers: {
    [id: string]: UserData;
  };
};

/**
 * Use this to modify the store.
 * Will not cause rerenders on state changes.
 */
export const store = syncedStore<Store>({ todos: [], storedUsers: {} });

// Get/create the Yjs document and sync automatically
const ydoc = getYjsDoc(store);

// Connect to remote server and sync
export const provider = new HocuspocusProvider({
  url: "wss://tasks-server.nicholaslyz.com",
  document: ydoc,
  name: DOCUMENT_NAME,

  // TESTING
  /* State diagram:
  onConnect -> onSynced: {state: true} -> onDisconnect ->
  onSynced: {state: false} -> onConnect ... */
  onConnect: () => notifications.show({ message: "onConnect" }),
  onSynced: (data) =>
    notifications.show({ title: "onSynced", message: JSON.stringify(data) }),
  onDisconnect: (data) =>
    notifications.show({
      title: "onDisconnect",
      message: JSON.stringify(data),
    }),
});

/**The unique ID for a user, persisted in localStorage, and shared across
 * browser tabs. */
export const USER_ID = (() => {
  /* Check localStorage for a clientID, and generate one if not existing */
  /* User ID doesn't exist */
  const existingId = localStorage.getItem("userId");
  if (!existingId) {
    const userId = uuidv4();
    localStorage.setItem("userId", userId);
    return userId;
  } else {
    return existingId;
  }
})();

/**Propagate userID (local GUID) to awareness object */
provider.on("sync", () => provider.setAwarenessField("userId", USER_ID));

/**
 * Selectively subscribe to changes in the store.
 * Optionally uses a debounce for performance.
 *
 * Returned values are not suitable for memoization.
 *
 * Note: selector function must return an observable slice of the
 * original store, as its result is used by observeDeep.
 */
export const useSyncedStore = <T,>(
  selector: (s: MappedTypeDescription<Store>) => T,
  debounceMs = 0
) => {
  const [state, setState] = useState({ value: selector(store) });

  useEffect(() => {
    const onUpdate = () => {
      setState({ value: selector(store) });
    };

    const debouncedUpdate = debounceMs
      ? debounce(onUpdate, debounceMs, { maxWait: debounceMs })
      : onUpdate;
    return observeDeep(selector ? selector(store) : store, debouncedUpdate);
  }, [debounceMs, selector]);

  return state.value;
};

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
    new IndexeddbPersistence(DOCUMENT_NAME, ydoc);
  } else
    setTimeout(
      () =>
        notifications.show({
          title: "IndexedDB not supported",
          message: "Changes will not be saved on exiting",
          color: "yellow",
        }),
      1000
    );
});
