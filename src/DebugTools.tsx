import { faker } from "@faker-js/faker";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Button } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Y, getYjsDoc } from "@syncedstore/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { useSyncedStore } from "@syncedstore/react";
import { formatISO } from "date-fns";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";
import { Suspense, lazy, useState } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { v4 as uuidv4 } from "uuid";
import { Doc } from "yjs";
import { DebugArmedButton } from "./DebugArmedButton";
import { CURRENT_ROOM_LOCALSTORAGE_KEY, USER_ID } from "./constants";
import { useCurrentList } from "./useCurrentList";
import { useProvider } from "./useProvider";
import { useStore } from "./useStore";
import { Store } from "./types/Store";
import { getMaxSortOrder, getRandomInt } from "./util";

declare global {
  interface Window {
    YDoc: Doc;
    provider: HocuspocusProvider;
    store: MappedTypeDescription<Store>;
  }
}

const LazyDevTools = lazy(() => import("./DevTools"));

/**
 * Some helpful utilities for debugging syncedStore and Yjs.
 * Returns a list of buttons.
 *
 * Uses StoreProviderContext.
 *
 * Lazily imported by AppHeader.
 */
export default function DebugTools() {
  const [roomId] = useLocalStorage({ key: CURRENT_ROOM_LOCALSTORAGE_KEY });
  const store = useStore();
  const provider = useProvider();
  const lists = store.lists;
  const todos = store.todos;
  const syncedStoreTodos = useSyncedStore(todos);
  const [devToolsEnabled, setDevToolsEnabled] = useState(false);
  const [currentList] = useCurrentList();
  const { showBoundary } = useErrorBoundary();

  const throwError = () => {
    showBoundary(Error("Test Error"));
  };

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
    window.store = store;
    notifications.show({
      message: "YDoc and store now available in window",
    });
  };

  const makeProviderAvailableInWindow = () => {
    window.provider = provider;
    notifications.show({
      message: "provider now available in window",
    });
  };

  const dumpStoredUsers = () => {
    alert(JSON.stringify(store.storedUsers, undefined, 2));
  };

  const dumpAwarenessStates = () => {
    alert(JSON.stringify(provider.awareness?.states, undefined, 2))
  }

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

  /**Generate 10 lists containing n (10 by default) todos each
   * @param n number of todos to generate per list
   * @param inCurrentList whether to only generate in current list
   */
  const generateTodos = (n = 10, inCurrentList = false) => {
    let lists: Array<string>;

    if (inCurrentList && currentList) {
      lists = [currentList];
    } else {
      lists = [...Array(10)]
        .map(() => {
          const id = uuidv4();
          const sortOrder = generateKeyBetween(
            getMaxSortOrder(store.lists, "sortOrder"),
            undefined
          );

          const generatedList = {
            id,
            name: `${id} sortOrder=${sortOrder}`,
            sortOrder,
          };
          store.lists.push(generatedList);

          return generatedList;
        })
        .map((l) => l.id);
    }

    lists.forEach((l) => {
      const sortKeys = generateNKeysBetween(
        getMaxSortOrder(
          store.todos.filter((t) => t.listId === l),
          "sortOrder"
        ),
        undefined,
        n
      ).reverse();

      [...Array(n)].forEach((_, idx) => {
        const id = uuidv4();
        const now = Date.now();
        const sortOrder = sortKeys[idx];
        const content = new Y.XmlFragment();
        const title = new Y.XmlElement("title");
        title.setAttribute("level", "1");
        title.insert(0, [
          new Y.XmlText(faker.lorem.words({ min: 3, max: 30 })),
        ]);
        content.insert(0, [title]);

        // Add random sentences
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

        // Add todoItems
        const taskList = new Y.XmlElement("taskList");
        [...Array(getRandomInt(0, 10))].forEach(() => {
          const task = new Y.XmlElement("taskItem");
          const paragraph = new Y.XmlElement("paragraph");
          paragraph.insert(0, [new Y.XmlText(faker.lorem.words())]);
          task.insert(0, [paragraph]);
          taskList.insert(0, [task]);
        });
        taskList.length && content.insert(content.length, [taskList]);

        const repeatDays = Math.random() > 0.5 ? undefined : 5;
        const dueDate =
          Math.random() > 0.5
            ? undefined
            : formatISO(new Date(), { representation: "date" });

        store.todos.push({
          id,
          sortOrder,
          content,
          completed: false,
          by: USER_ID,
          created: now,
          modified: now,
          listId: l,
          dueDate,
          repeatDays,
        });
      });
    });
  };

  const markAllCompleted = () => {
    currentList &&
      store.todos
        .filter((t) => t.listId === currentList)
        .forEach((t) => (t.completed = true));
  };

  const enableDevTools = () => setDevToolsEnabled(true);

  const debugLayout = () =>
    document.querySelectorAll<HTMLElement>("*").forEach((a) => {
      // https://www.smashingmagazine.com/2021/04/css-overflow-issues/
      a.style.outline =
        "1px solid #" + (~~(Math.random() * (1 << 24))).toString(16);
    });

  const benchmarkForEach = () => {
    const start = performance.now();
    syncedStoreTodos.filter((t) => t.id === "");
    const end = performance.now();
    console.log(`Took ${end - start}ms`);
  };

  return (
    <>
      {[
        [throwError, "Throw error"] as const,
        [
          clearStoredUsers,
          "Clear storedUsers (affects all users)",
          true,
        ] as const,
        [clearLocalStorage, "Clear localStorage (will reload)", true] as const,
        [clearIndexedDb, `Clear IndexedDB for this room`, true] as const,
        [
          makeYdocAvailableInWindow,
          "Make YDoc and store available in window",
        ] as const,
        [dumpStoredUsers, "Dump storedUsers"] as const,
        [dumpAwarenessStates, "Dump awareness.states"] as const,
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
        [
          () => generateTodos(1, true),
          "Generate 1 todos in current list",
          true,
        ] as const,
        [
          () => generateTodos(100, true),
          "Generate 100 todos in current list",
          true,
        ] as const,
        [enableDevTools, "Enable devtools in-browser"] as const,
        [
          makeProviderAvailableInWindow,
          "Make provider available in window",
        ] as const,
        [debugLayout, "Debug layout"] as const,
        [markAllCompleted, "Complete all todos in current list", true] as const,
        [
          benchmarkForEach,
          "Benchmark forEach (yjs) with element access",
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
      {devToolsEnabled && (
        <Suspense fallback="loading">
          <LazyDevTools />
        </Suspense>
      )}
    </>
  );
}
