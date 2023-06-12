import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useMemo } from "react";
import { SavedRooms } from "./Login";
import {
  CURRENT_ROOM_LOCALSTORAGE_KEY,
  SAVED_ROOMS_LOCALSTORAGE_KEY,
} from "./constants";
import { useIsConnected } from "./useIsConnected";
import { useStore } from "./useStore";
import { selectMeta, useSyncedStore } from "./useSyncedStore";
import { useUserData } from "./useUserData";

/**Updates the stored roomName in localStorage whenever meta.roomName is
 * modified, and sets defaults
 */
export const UpdateStoredRoomName = () => {
  const [currentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });
  const meta = useSyncedStore(selectMeta);
  const [, setSavedRooms] = useLocalStorage<SavedRooms>({
    key: SAVED_ROOMS_LOCALSTORAGE_KEY,
    defaultValue: {},
  });
  const [userData] = useUserData();
  const store = useStore();
  const isConnected = useIsConnected();

  const defaultRoomName = useMemo(
    () => `${userData.user.name}'s room`,
    [userData.user.name]
  );

  /* Set a default room name if none was provided */
  useEffect(() => {
    if (isConnected && !meta.roomName) {
      store.meta.roomName = defaultRoomName;
    }
  }, [defaultRoomName, isConnected, meta.roomName, store.meta]);

  useEffect(() => {
    /* Set a default room name if none was given*/
    setSavedRooms((s) => ({
      ...s,
      [currentRoomId]: meta.roomName as string,
    }));
  }, [currentRoomId, meta.roomName, setSavedRooms]);

  return null;
};
