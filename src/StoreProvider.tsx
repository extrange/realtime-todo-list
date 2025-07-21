import { HocuspocusProvider } from "@hocuspocus/provider";
import { notifications } from "@mantine/notifications";
import syncedStore from "@syncedstore/core";
import type { MappedTypeDescription } from "@syncedstore/core/types/doc";
import type React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { FORCE_SYNC_INTERVAL, USER_ID } from "./constants";
import { ProviderContext } from "./ProviderContext";
import { RoomContext } from "./RoomContext";
import { StoreContext } from "./StoreContext";
import type { Store } from "./types/Store";

/**
 * Supplies contexts for Hocuspocus Provider and SyncedStore. Also updates
 * the UUID:RoomName mapping in localstorage on changes in meta.
 *
 * Usage:
 * - To modify the store, use useStore.
 * - To update awareness and listen to events, use useProvider.
 */

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
	const roomContext = useContext(RoomContext);

	// Initialize YDoc
	const yDoc = useRef<Y.Doc>(new Y.Doc());
	const [store, setStore] = useState<MappedTypeDescription<Store>>();
	const [provider, setProvider] = useState<HocuspocusProvider>();

	/* Initialize Y.Doc, setup listeners for awareness propagation,
  setup IndexedDB */
	useEffect(() => {
		/* Don't attempt connection if no roomId is present */
		const roomId = roomContext?.roomId;
		if (!roomId) return;

		// First, generate the yDoc
		yDoc.current = new Y.Doc();

		//Then connect store and provider
		setStore(
			syncedStore<Store>(
				{ todos: [], storedUsers: {}, meta: {}, lists: [] },
				yDoc.current,
			),
		);
		const _provider = new HocuspocusProvider({
			url: "wss://tasks-server.nicholaslyz.com",
			document: yDoc.current,
			name: roomId,
			forceSyncInterval: FORCE_SYNC_INTERVAL,
		});

		setProvider(_provider);

		/* Propagate userID (local GUID) to awareness object */
		_provider.on("sync", () => _provider.setAwarenessField("userId", USER_ID));

		// Check if IndexedDB is supported, then sync
		let indexeddbPersistence: IndexeddbPersistence | undefined;
		new Promise<IDBDatabase>((resolve) => {
			const request = indexedDB.open(`test-${Math.random()}`);
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
			setStore(undefined);
			setProvider(undefined);
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
