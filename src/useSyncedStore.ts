import { getYjsValue, observeDeep } from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { DeepReadonly } from "ts-essentials";
import * as Y from "yjs";
import { XmlFragment } from "yjs";
import { User } from "./App";
import { useStore } from "./useStore";
import { DEVELOPMENT } from "./constants";

export type Todo = {
  /**The content of the task, used by the TipTap editor. */
  content: XmlFragment;

  /**Whether the task is completed or not */
  completed: boolean;

  /**UTC timestamp of the last modification. This includes
   * marking the task as completed. */
  modified: number;

  /**userId of the user who last modified this task. */
  by: string;

  /**UTC timestamp of when this todo was created. */
  created: number;

  id: string;

  /**A string used for lexicographical (fractional) sorting.
   * https://observablehq.com/@dgreensp/implementing-fractional-indexing
   */
  sortOrder: string;

  /**Whether this task should be in the 'Focus' view.*/
  focus?: boolean;

  /**Sort order for this task in the 'Focus' view.*/
  focusSortOrder?: string;

  /**UUID of the list this todo belongs to. */
  listId?: string;

  /**
   * Due date in ISO8601 (e.g. 2023-06-11). Parse with `Date.parse()`.
   *
   * Note: `Date.parse()` returns a date in **UTC** when giving a date-only
   * string.
   */
  dueDate?: string;

  /**Number of days the next dueDate is set after, when todo is marked
   * completed.
   */
  repeatDays?: number;
};

export type List = {
  name: string;
  id: string;
  sortOrder: string;
};

/**The master copy is stored in localStorage, and changes
 * are synced to this object via useUser. Values could be undefined
 * if store is in the progress of updating. */
export type UserData = {
  user?: User;

  /**The last time the user was non-idle.
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

  /**Room-specific properties. */
  meta: {
    /**Name of the room. The roomId is the name of the backing
     * Y Doc. */
    roomName?: string;
  };

  lists: List[];
};

/**
 * Reactively subscribe to changes in a slice of the store.
 * Uses a debounce by default for performance.
 *
 * Returns an immutable snapshot of the store that can be used for memoization.
 *
 * Note:
 * - Selector function must return an observable slice of the
 * original store, as its result is used by observeDeep.
 * - Selector function should be memoized to prevent renders
 * - Doesn't work with `.filter` (yet)
 *
 * @returns `toJSON` representation of the observed Yjs type
 */
export const useSyncedStoreCustomImpl = <T>(
  selector: (s: MappedTypeDescription<Store>) => T,
  debounceMs = 300
): DeepReadonly<T> => {
  const store = useStore();

  /**Attempt to shallowly copy the selected state.
   *
   * Performance notes:
   * - toJSON(): slowest
   * - [...store.todos] - shallow copy proxied array - slow
   * - .slice() - fast
   * - getYjsValue - fast
   */
  const unwrapSelectedState = useCallback(() => {
    const proxiedSlice = selector(store);
    const yjsSlice = getYjsValue(proxiedSlice);
    if (yjsSlice instanceof Y.Array) {
      return (selector(store) as Array<unknown>).slice();
    } else if (yjsSlice instanceof Y.Map) {
      return { ...proxiedSlice };
    } else return yjsSlice?.toJSON();
  }, [selector, store]);

  const now = performance.now();

  const [state, setState] = useState(unwrapSelectedState);

  const duration = performance.now() - now;
  if (DEVELOPMENT && duration >= 10)
    console.log(`useSyncedStore: ${duration}ms`);

  useEffect(() => {
    const onUpdate = () => {
      const now = performance.now();
      setState(unwrapSelectedState());
      const duration = performance.now() - now;
      if (DEVELOPMENT && duration >= 10)
        console.log(`useSyncedStore: ${duration}ms`);
    };

    const debouncedUpdate = debounceMs
      ? debounce(onUpdate, debounceMs, { maxWait: debounceMs })
      : onUpdate;

    return observeDeep(selector ? selector(store) : store, debouncedUpdate);
  }, [debounceMs, selector, store, unwrapSelectedState]);

  return state;
};

/* Selectors for memoization */
export const selectStore = (s: MappedTypeDescription<Store>) => s;
export const selectTodos = (s: MappedTypeDescription<Store>) => s.todos;
export const selectLists = (s: MappedTypeDescription<Store>) => s.lists;
export const selectStoredUsers = (s: MappedTypeDescription<Store>) =>
  s.storedUsers;
export const selectMeta = (s: MappedTypeDescription<Store>) => s.meta;
