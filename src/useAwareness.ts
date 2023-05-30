import { isEqual } from "lodash";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { provider } from "./store";

export const useAwareness = () => {
  const state = useRef<Record<string, object>[]>();
  const subscribe = useCallback((onUpdate: () => void) => {
    provider.on("awarenessChange", onUpdate);
    return () => provider.off("awarenessChange", onUpdate);
  }, []);
  
  const getSnapshot = useCallback(() => {
    const incoming = Array.from(provider.awareness.states.values());
    // TODO there shouldn't be a need to deepequal, we already know there's an update
    if (isEqual(incoming, state.current)) {
      return state.current;
    }

    state.current = incoming;

    return state.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot);
};
