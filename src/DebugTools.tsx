import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getYjsDoc } from "@syncedstore/core";
import { Doc } from "yjs";
import { DOCUMENT_NAME } from "./constants";
import { store } from "./store";

declare global {
  interface Window {
    YDoc: Doc;
  }
}

/**Some helpful utilities for debugging syncedStore and Yjs.
 * Returns a list of buttons.
 */
export const DebugTools = () => {
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
      window.indexedDB.deleteDatabase(DOCUMENT_NAME);
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

  return (
    <>
      {[
        [clearStoredUsers, "Clear storedUsers (affects all users)"] as const,
        [clearLocalStorage, "Clear localStorage (will reload)"] as const,
        [clearIndexedDb, "Clear IndexedDB"] as const,
        [
          makeYdocAvailableInWindow,
          "Make YDoc available (as window.YDoc)",
        ] as const,
      ].map(([handler, title]) => (
        <Button variant="subtle" onClick={handler}>
          {title}
        </Button>
      ))}
    </>
  );
};
