import { Button, Group } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { SavedRooms } from "./Login";
import {
    CURRENT_ROOM_LOCALSTORAGE_KEY,
    SAVED_ROOMS_LOCALSTORAGE_KEY,
} from "./constants";

type InputProps = {
  /**Optional callback on room selection */
  onCloseHandler?: () => void;
};

/**Shows the user's saved rooms, and allows editing/deleting.
 *
 * Requires RoomProvider higher in the tree.
 */
export const SavedRoomsView = ({ onCloseHandler }: InputProps) => {
  const [savedRooms, setSavedRooms] = useLocalStorage<SavedRooms>({
    key: SAVED_ROOMS_LOCALSTORAGE_KEY,
    defaultValue: {},
  });

  /* Will cause RoomProvider to reload StoreProvider */
  const [currentRoomId, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  const deleteSavedRoom = useCallback(
    (id: string) => {
      setSavedRooms((s) => {
        const clone = Object.assign({}, s);
        delete clone[id];
        return clone;
      });
    },
    [setSavedRooms]
  );

  const onDelete = useCallback(
    (id: string, name: string | null) =>
      (e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation();
        if (confirm(`Forget '${name ?? "unnamed room"}'?`)) {
          deleteSavedRoom(id);
        }
      },
    [deleteSavedRoom]
  );

  const selectRoom = useCallback(
    (id: string) => () => {
      setCurrentRoomId(id);
      onCloseHandler?.();
    },
    [onCloseHandler, setCurrentRoomId]
  );

  return (
    <Group>
      {import.meta.env.VITE_TEST_ROOM && (
        <Button
          variant="light"
          onClick={selectRoom(import.meta.env.VITE_TEST_ROOM)}
        >
          Test Room
        </Button>
      )}
      {Object.entries(savedRooms)
        /* Exclude current room*/
        .filter(([id]) => id !== currentRoomId)
        .map(([id, name]) => (
          <Button
            key={id}
            rightIcon={<IconX onClick={onDelete(id, name)} />}
            variant="light"
            onClick={selectRoom(id)}
          >
            {name || "Unnamed Room"}
          </Button>
        ))}
    </Group>
  );
};
