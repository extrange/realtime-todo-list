import { useNetwork } from "@mantine/hooks";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useIsConnected } from "./useIsConnected";
import { useProvider } from "./useProvider";

/**
 * Attempt reconnection whenever sync status changes, or unsyncedChanges
 * crosses a threshold.
 *
 * Will only reattempt when online (by navigator.onLine).
 *
 * @param interval How frequently to attempt a reconnection
 *
 * @returns {boolean} Whether a reconnection is in progress
 */
export const useReconnect = (interval = 3000): boolean => {
  const isConnected = useIsConnected();
  const { online } = useNetwork();

  const provider = useProvider();
  const [reconnecting, setReconnecting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reconnect = useCallback(
    debounce(
      () => {
        console.log("attempt");
        provider.connect();
      },
      interval,
      { maxWait: interval }
    ),
    [provider, interval]
  );

  useEffect(() => {
    /* Only attempt if online, and either not synced or many unsynced changes*/
    if (online && !isConnected) {
      reconnect();
      const timer = setInterval(reconnect, interval);
      setReconnecting(true);
      return () => clearInterval(timer);
    } else setReconnecting(false);
  }, [interval, isConnected, online, reconnect]);

  return reconnecting;
};
