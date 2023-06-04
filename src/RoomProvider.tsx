/* Prompt user the room to join, or load from localStorage if present. */

import { useLocalStorage } from "@mantine/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { RoomContext } from "./RoomContext";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";

/**Reacts to changes in the stored current room in localStorage.
 *
 * To view/change rooms, make changes to the localStorage key
 * CURRENT_ROOM_LOCALSTORAGE_KEY.
 */
export const RoomProvider = ({ children }: React.PropsWithChildren) => {
  const [roomId, setRoomId] = useState<string | undefined>();
  const [currentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  useEffect(() => {
    setRoomId(currentRoomId);
  }, [currentRoomId]);

  const providerValue = useMemo(
    () => ({ roomId, setRoomId }),
    [roomId, setRoomId]
  );

  return (
    <RoomContext.Provider value={providerValue}>
      {children}
    </RoomContext.Provider>
  );
};
