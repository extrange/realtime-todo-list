import { Todo } from "./Todo";
import { List } from "./List";
import { UserData } from "./UserData";


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
  };

  lists: List[];
};
