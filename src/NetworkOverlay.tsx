import { Badge, Center, Loader, Overlay, Transition } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { useIsConnected } from "./useIsConnected";
import { useReconnect } from "./useReconnect";

/**Handles reconnection, and shows an overlay.
 *
 * Shows offline (no connection), reconnecting and nothing (when connected).
 *
 * Takes up 100% of parent height and width.
 */
export const NetworkOverlay = React.memo(() => {
  const isReconnecting = useReconnect();
  const isConnected = useIsConnected();

  /* Controls transition when moving from true to false */
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    setJustReconnected(true);
    const timer = setTimeout(() => setJustReconnected(false), 3000);
    return () => clearTimeout(timer);
  }, [isConnected]);

  const connected = useMemo(
    () => (
      <Badge variant="filled" color="green">
        Connected!
      </Badge>
    ),
    []
  );
  const reconnecting = useMemo(
    () => (
      <Badge
        color="orange"
        variant="filled"
        styles={{ inner: { display: "flex", alignItems: "center" } }}
      >
        Reconnecting
        <Loader size="xs" ml={5} color="white" />
      </Badge>
    ),
    []
  );
  const offline = useMemo(
    () => (
      <Badge variant="filled" color="red">
        Offline
      </Badge>
    ),
    []
  );

  return (
    /* Show if: justReconnected, or reconnecting/offline */
    <Transition transition={"fade"} mounted={justReconnected || !isConnected}>
      {(styles) => (
        <Overlay color="red" blur={2} style={styles} opacity={0}>
          <Center h="100%">
            {isConnected ? connected : isReconnecting ? reconnecting : offline}
          </Center>
        </Overlay>
      )}
    </Transition>
  );
});
