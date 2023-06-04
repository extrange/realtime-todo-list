import { getYjsValue, observeDeep } from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { DeepReadonly } from "ts-essentials";
import { XmlFragment } from "yjs";
import { User } from "./App";
import { useStore } from "./useStore";

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

  /**The id is the userId of the user is stored in localStorage, and
   * randomly generated on first run. */
  storedUsers: {
    [id: string]: UserData;
  };

  /**Name of the room. The roomId is the name of the backing
   *Y Doc. */
  room: { name?: string };
};

/**
 * Reactively subscribe to changes in the store.
 * Uses a debounce by default for performance.
 *
 * Returns an immutable snapshot of the store that can be used for memoization.
 *
 * Note:
 * - Selector function must return an observable slice of the
 * original store, as its result is used by observeDeep.
 * - Selector function should be memoized to prevent renders
 *
 * @returns `toJSON` representation of the observed Yjs type
 */
export const useSyncedStore = <T>(
  selector: (s: MappedTypeDescription<Store>) => T,
  debounceMs = 300
): DeepReadonly<T> => {
  const store = useStore();
  const [state, setState] = useState(getYjsValue(selector(store))?.toJSON());

  useEffect(() => {
    const onUpdate = () => {
      setState(getYjsValue(selector(store))?.toJSON());
    };

    const debouncedUpdate = debounceMs
      ? debounce(onUpdate, debounceMs, { maxWait: debounceMs })
      : onUpdate;

    return observeDeep(selector ? selector(store) : store, debouncedUpdate);
  }, [debounceMs, selector, store]);

  return state;
};