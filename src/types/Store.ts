import type { List } from "./List";
import type { Todo } from "./Todo";
import type { UserData } from "./UserData";

export type Store = {
	todos: Todo[];

	/**The id is the userId of the user is stored in localStorage, and
	 * randomly generated on first run. */
	storedUsers: {
		[id: string]: UserData;
	};

	/**Room-specific properties. */
	meta: {
		/**Name of the room. The roomId is the name of the backing
		 * Y Doc. */
		roomName?: string;

		/**If set, the app enters read-only mode. Contains the UUID of
		 * the room that data has been migrated to. */
		nextRoomId?: string;
	};

	lists: List[];
};
