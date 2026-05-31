import { useSyncedStore } from "@syncedstore/react";
import { useStore } from "./useStore";

export const useIsReadOnly = () => {
	const store = useStore();
	const meta = useSyncedStore(store.meta);
	const nextRoomId = meta.nextRoomId;
	return { isReadOnly: !!nextRoomId, nextRoomId } as const;
};
