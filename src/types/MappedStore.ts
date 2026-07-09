import type { List } from "./List";
import type { Todo } from "./Todo";
import type { UserData } from "./UserData";

export type MappedStoreType = {
	todos: Todo[];
	storedUsers: Partial<Record<string, UserData>>;
	meta: Partial<{
		roomName?: string;
		nextRoomId?: string;
	}>;
	lists: List[];
};
