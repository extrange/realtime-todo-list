import { Button } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { getYjsDoc } from "@syncedstore/core";
import { Doc } from "yjs";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import { useStore } from "./useStore";

declare global {
  interface Window {
    YDoc: Doc;
  }
}

/**Some helpful utilities for debugging syncedStore and Yjs.
 * Returns a list of buttons.
 *
 * Uses StoreProviderContext.
 */
export const DebugTools = () => {
  const [roomId] = useLocalStorage({ key: CURRENT_ROOM_LOCALSTORAGE_KEY });
  const store = useStore();

  const clearStoredUsers = () => {
    try {
      Object.keys(store.storedUsers).forEach(
        (k) => delete store.storedUsers[k]
      );
      notifications.show({
        message: "Deleted store.storedUsers",
        autoClose: false,
      });
    } catch (e) {
      notifications.show({
        title: "Error deleting store.storedUsers",
        message: JSON.stringify(e),
        color: "red",
      });
    }
  };
  const clearLocalStorage = () => {
    localStorage.clear();
    location.reload();
  };

  const clearIndexedDb = () => {
    try {
      roomId && window.indexedDB.deleteDatabase(roomId);
      notifications.show({ message: "IndexedDB cleared successfully" });
    } catch (e) {
      notifications.show({
        title: "Error clearing IndexedDB",
        message: JSON.stringify(e),
        color: "red",
      });
    }
  };

  const makeYdocAvailableInWindow = () => {
    window.YDoc = getYjsDoc(store);
    notifications.show({
      message: "YDoc now available in window",
    });
  };

  const dumpStoredUsers = () => {
    alert(JSON.stringify(store.storedUsers, undefined, 2));
  };

  const dumpLocalStorage = () => {
    alert(JSON.stringify(Object.entries(localStorage), undefined, 2));
  };

  return (
    <>
      {[
        [clearStoredUsers, "Clear storedUsers (affects all users)"] as const,
        [clearLocalStorage, "Clear localStorage (will reload)"] as const,
        [clearIndexedDb, `Clear IndexedDB for this room`] as const,
        [
          makeYdocAvailableInWindow,
          "Make YDoc available (as window.YDoc)",
        ] as const,
        [dumpStoredUsers, "Dump storedUsers"] as const,
        [dumpLocalStorage, "Dump localStorage"] as const,
      ].map(([handler, title]) => (
        <Button key={title} variant="subtle" onClick={handler}>
          {title}
        </Button>
      ))}
    </>
  );
};
