import { HocuspocusProvider, WebSocketStatus } from "@hocuspocus/provider";
import { debounce } from "lodash-es";
import { useCallback, useSyncExternalStore } from "react";
import { useProvider } from "./useProvider";

/**Mapped HocusPocus Provider events. */
export type SupportedProviderEvent = {
  /** When the connections status changes.
   *
   * Unreliable: could be `connected` even if there is no network.
   */
  status: WebSocketStatus;

  /**When sync has been completed.
   *
   * Unreliable: could be false, despite syncing occuring.
   * Could be true even when there is no network (Chrome).
   */
  synced: boolean;

  /**Number of unsynced changes. 0 if in sync.
   *
   * Most reliable of all.
   */
  unsyncedChanges: number;
};

type Options = {
  delay: number;
};

/**
 * Subscribe to a HocusPocus Provider event. Debounced by default.
 *
 * State diagram:
 *
 * onConnect -> onSynced: {state: true} -> onDisconnect ->
 * onSynced: {state: false} -> onConnect -> ...
 *
 * Notes:
 * - onClose is not used because it tends to send a lot of messages
 * - `unsyncedChanges` is not reliable anymore: it is > 0 even after syncing.
 * - sometimes, `synced` becomes false after reconnection, even though changes
 *   are still being synced.
 * - Chrome doesn't set `navigator.onLine` to false when disconnected, as a
 *   result, `synced`, `status` and `isConnected` all return true. However,
 *   `unsyncedChanges` continues to increase.
 * - After reconnecting, Firefox sometimes only receives changes, and doesn't
 * send changes.
 * - when `status` is disconnected, the app needs to be reminded to connect
 * (in such a state it's 'given up`)
 * */
export const useProviderEvent = <T extends keyof SupportedProviderEvent>(
  event: T,
  { delay }: Options = { delay: 500 }
): SupportedProviderEvent[T] => {
  const provider = useProvider();

  const eventMap = useCallback(
    (p: HocuspocusProvider): SupportedProviderEvent => ({
      status: p.status,
      synced: p.synced,
      unsyncedChanges: p.unsyncedChanges,
    }),
    []
  );

  const subscribe = useCallback(
    (callback: () => void) => {
      const debouncedCallback = delay
        ? debounce(callback, delay, { maxWait: delay })
        : callback;

      if (event === "unsyncedChanges") {
        /* Special case */
        provider.on("outgoingMessage", debouncedCallback);
        return () => provider.off("outgoingMessage", debouncedCallback);
      } else {
        provider.on(event, debouncedCallback);
        return () => provider.off(event, debouncedCallback);
      }
    },
    [delay, event, provider]
  );

  const getSnapshot = useCallback(
    () => eventMap(provider)[event],
    [event, eventMap, provider]
  );

  return useSyncExternalStore(subscribe, getSnapshot);
};
