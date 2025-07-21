import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";
import { USER_ID } from "./constants";
import type { UserData } from "./types/UserData";
import { useStore } from "./useStore";
import { generateUser } from "./util";

const defaultUser: Required<UserData> = {
	lastActive: Date.now(),
	user: generateUser(),
};

/** UserData in localStorage is the source of truth.
 * Changes to userData are synced to the shared storedUsers object.
 */
export const useUserData = () => {
	const store = useStore();
	const [user, setUser] = useLocalStorage<Required<UserData>>({
		key: "user",
		defaultValue: defaultUser,
	});

	/* Sync changes with syncedStore, whenever user is modified */
	useEffect(() => {
		store.storedUsers[USER_ID] = user;
	}, [user, store]);

	return [user, setUser] as const;
};
