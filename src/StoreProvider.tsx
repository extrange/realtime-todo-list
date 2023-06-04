import { HocuspocusProvider } from "@hocuspocus/provider";
import { notifications } from "@mantine/notifications";
import syncedStore from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import React, { useContext, useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { ProviderContext } from "./ProviderContext";
import { RoomContext } from "./RoomContext";
import { StoreContext } from "./StoreContext";
import { USER_ID } from "./constants";
import { Store } from "./useSyncedStore";

/* Doc -> Both provider and store. But provider is used for awareness, while store is user for mutation. Room updates should be done at provider, which will then affect the store? */
/**
 * Supplies contexts for Hocuspocus Provider and SyncedStore.
 *
 * Use the store context to modify the store.
 *
 * Use the provider context to update awareness and listen to events.
 */

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const roomContext = useContext(RoomContext);

  // Initialize YDoc
  const yDoc = useRef<Y.Doc>(new Y.Doc());
  const [store, setStore] = useState<MappedTypeDescription<Store>>();
  const [provider, setProvider] = useState<HocuspocusProvider>();

  useEffect(() => {
    /* Don't attempt connection if no roomId is present */
    const roomId = roomContext?.roomId;
    if (!roomId) return;

    // First, generate the yDoc
    yDoc.current = new Y.Doc();

    //Then connect store and provider
    setStore(
      syncedStore<Store>({ todos: [], storedUsers: {}, room: {} }, yDoc.current)
    );
    const _provider = new HocuspocusProvider({
      url: "wss://tasks-server.nicholaslyz.com",
      document: yDoc.current,
      name: roomId,

      // TESTING
      /* State diagram:
  onConnect -> onSynced: {state: true} -> onDisconnect ->
  onSynced: {state: false} -> onConnect ... */
      onConnect: () => notifications.show({ message: "onConnect" }),
      onSynced: (data) =>
        notifications.show({
          title: "onSynced",
          message: JSON.stringify(data),
        }),
      onDisconnect: (data) =>
        notifications.show({
          title: "onDisconnect",
          message: JSON.stringify(data),
        }),
    });

    setProvider(_provider);

    /**Propagate userID (local GUID) to awareness object */
    _provider.on("sync", () => _provider.setAwarenessField("userId", USER_ID));

    let indexeddbPersistence: IndexeddbPersistence | undefined;

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
        indexeddbPersistence = new IndexeddbPersistence(roomId, yDoc.current);
      } else
        () =>
          notifications.show({
            title: "IndexedDB not supported",
            message: "Changes will not be saved on exiting",
            color: "yellow",
          });
    });

    /* Cleanup, for example when room is changed/removed. */
    return () => {
      _provider.destroy();
      indexeddbPersistence?.destroy();
      setStore(undefined)
      setProvider(undefined)
    };
  }, [roomContext]);

  return (
    <StoreContext.Provider value={store}>
      <ProviderContext.Provider value={provider}>
        {children}
      </ProviderContext.Provider>
    </StoreContext.Provider>
  );
};
