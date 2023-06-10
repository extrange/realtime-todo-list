import { useIdle } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { IDLE_TIMEOUT, USER_ID } from "./constants";
import { useStore } from "./useStore";
import { useUserData } from "./useUserData";


/** How often to update lastActive when not idle */
const UPDATE_INTERVAL = 5000;

/**Update storedUser.lastActive when not idle. */
export const IdleDetect = () => {
  const store = useStore();
  const idle = useIdle(IDLE_TIMEOUT);
  const [user, setUser] = useUserData();
  const handlerId = useRef<number>();

  /* Update lastActive in localStorage */
  useEffect(() => {
    /* First, clear any handlers updating user status */
    clearInterval(handlerId.current);

    /* If user is active, continuously update lastActive every 5s*/
    if (!idle) {
      handlerId.current = setInterval(
        () => setUser((u) => ({ ...u, lastActive: Date.now() })),
        UPDATE_INTERVAL
      );
    }

    setUser((u) => ({ ...u, lastActive: Date.now() }));

    /* If the user is idle, no status updates would run. */

    return () => clearInterval(handlerId.current);
  }, [idle, setUser]);

  /* Update lastActive in syncedStore */
  useEffect(() => {
    const storedUser = store.storedUsers[USER_ID];
    storedUser && (storedUser.lastActive = Date.now());
  }, [user, store]);

  return null;
};
