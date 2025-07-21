import { User } from "./User";

/**
 * The master copy is stored in localStorage, and changes
 * are synced to this object via useUser. Values could be undefined
 * if store is in the progress of updating. */
export type UserData = {
	user?: User;

	/**The last time the user was non-idle.
	 * Updated even if the user was offline.
	 */
	lastActive?: number;
};
