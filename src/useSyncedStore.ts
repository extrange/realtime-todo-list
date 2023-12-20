import { getYjsValue, observeDeep } from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useState } from "react";
import { DeepReadonly } from "ts-essentials";
import * as Y from "yjs";
import { useStore } from "./useStore";
import { DEVELOPMENT } from "./constants";
import { Store } from "./types/Store";

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
 * @deprecated
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
