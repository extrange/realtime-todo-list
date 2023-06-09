import { faker } from "@faker-js/faker";
import { Button } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Y, getYjsDoc } from "@syncedstore/core";
import { generateKeyBetween } from "fractional-indexing";
import { v4 as uuidv4 } from "uuid";
import { Doc } from "yjs";
import { DebugArmedButton } from "./DebugArmedButton";
import { CURRENT_ROOM_LOCALSTORAGE_KEY, USER_ID } from "./constants";
import { useStore } from "./useStore";
import {
  List,
  selectLists,
  selectTodos,
  useSyncedStore,
} from "./useSyncedStore";
import { getMaxSortOrder } from "./util";

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
  const lists = useSyncedStore(selectLists);
  const todos = useSyncedStore(selectTodos);

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

  const dumpStore = () => {
    alert(JSON.stringify(store, undefined, 2));
  };

  /**Dump todos which have a listId of a non-existent list */
  const dumpOrphanedTodos = () => {
    const listIds = lists.map((l) => l.id);
    const orphanedTodos = todos.filter(
      (t) => t.listId && !listIds.includes(t.listId)
    );
    alert(JSON.stringify(orphanedTodos, undefined, 2));
  };

  const deleteAllTodos = () => {
    store.todos.forEach((t) =>
      store.todos.splice(
        store.todos.findIndex((t2) => t2.id === t.id),
        1
      )
    );
    notifications.show({ message: "Deleted all todos" });
  };

  const deleteAllLists = () => {
    store.lists.forEach((t) =>
      store.lists.splice(
        store.lists.findIndex((t2) => t2.id === t.id),
        1
      )
    );
    notifications.show({ message: "Deleted all lists" });
  };

  /**Generate 10 lists containing n (10 by default) todos each */
  const generateTodos = (n = 10) => {
    const lists: Array<List> = [...Array(10)].map(() => {
      const id = uuidv4();
      const sortOrder = generateKeyBetween(
        getMaxSortOrder(store.lists),
        undefined
      );

      const generatedList = {
        id,
        name: `${id} sortOrder=${sortOrder}`,
        sortOrder,
      };
      store.lists.push(generatedList);

      return generatedList;
    });

    lists.forEach((l) => {
      [...Array(n)].forEach(() => {
        const id = uuidv4();
        const now = Date.now();
        const sortOrder = generateKeyBetween(
          getMaxSortOrder(store.todos.filter((t) => t.id === l.id)),
          undefined
        );
        const content = new Y.XmlFragment();
        const title = new Y.XmlElement("title");
        title.setAttribute("level", "1");
        title.insert(0, [
          new Y.XmlText(faker.lorem.words({ min: 3, max: 30 })),
        ]);
        content.insert(0, [title]);

        if (Math.random() > 0.3) {
          const sentences = faker.lorem.sentences({ min: 1, max: 5 }, "\n");
          content.insert(
            1,
            sentences.split("\n").map((s) => {
              const paragraph = new Y.XmlElement("paragraph");
              paragraph.insert(0, [new Y.XmlText(s)]);
              return paragraph;
            })
          );
        }

        store.todos.push({
          id,
          sortOrder,
          content,
          completed: false,
          by: USER_ID,
          created: now,
          modified: now,
          listId: l.id,
        });
      });
    });
  };

  return (
    <>
      {[
        [
          clearStoredUsers,
          "Clear storedUsers (affects all users)",
          true,
        ] as const,
        [clearLocalStorage, "Clear localStorage (will reload)", true] as const,
        [clearIndexedDb, `Clear IndexedDB for this room`, true] as const,
        [
          makeYdocAvailableInWindow,
          "Make YDoc available (as window.YDoc)",
        ] as const,
        [dumpStoredUsers, "Dump storedUsers"] as const,
        [dumpLocalStorage, "Dump localStorage"] as const,
        [dumpStore, "Dump entire store"] as const,
        [dumpOrphanedTodos, "Dump orphaned todos"] as const,
        [deleteAllTodos, "DELETE ALL TODOS", true] as const,
        [deleteAllLists, "DELETE ALL LISTS", true] as const,
        [
          () => generateTodos(),
          "Generate 10 todos in 10 new lists",
          true,
        ] as const,
        [
          () => generateTodos(100),
          "Generate 100 todos in 10 new lists (slow)",
          true,
        ] as const,
      ].map(([handler, title, requireArm = false]) =>
        requireArm ? (
          <DebugArmedButton key={title} variant="filled" onClick={handler}>
            {title}
          </DebugArmedButton>
        ) : (
          <Button key={title} variant="filled" onClick={handler}>
            {title}
          </Button>
        )
      )}
    </>
  );
};
