import { Button, Flex } from "@mantine/core";

import { generateKeyBetween } from "fractional-indexing";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { ListType } from "./ListContext";
import { ListItem } from "./ListItem";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { selectLists, selectTodos, useSyncedStore } from "./useSyncedStore";
import { getMaxSortOrder } from "./util";

type CurrentListNameChange = "currentListNameChange";

declare global {
  interface Document {
    addEventListener<K extends CurrentListNameChange>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
    removeEventListener<K extends CurrentListNameChange>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
  }
}

type InputProps = {
  closeNav: () => void;
};

export const ListView = ({ closeNav }: InputProps) => {
  const store = useStore();
  const lists = useSyncedStore(selectLists);
  const [currentList, setCurrentList] = useCurrentList();

  const createList = useCallback(() => {
    const name = prompt("Enter list name:");
    if (!name) return;
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(store.lists, "sortOrder"),
      undefined
    );
    const newListId = uuidv4();
    selectLists(store).push({ id: newListId, name: name, sortOrder });
    setCurrentList(newListId);
    closeNav();
  }, [closeNav, setCurrentList, store]);

  /* Sort lists alphabetically */
  const sortedLists = useMemo(
    () => lists.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [lists]
  );

  /* Select Uncategorized/other lists with IDs */
  const selectList = useCallback(
    (listId?: string) => {
      setCurrentList(listId);
      closeNav();
    },
    [closeNav, setCurrentList]
  );

  const selectFocus = useCallback(() => {
    setCurrentList(ListType.Focus);
    closeNav();
  }, [closeNav, setCurrentList]);

  /* Deleting a list deletes all tasks the list, including completed tasks */
  const deleteList = useCallback(
    (listId: string) => {
      const name = lists.find((l) => l.id === listId)?.name;

      if (!confirm(`Delete '${name}'? This will delete all todos as well.`))
        return;

      /* First delete all the tasks in the list */
      const storeTodos = selectTodos(store);
      storeTodos
        .filter((t) => t.listId === listId)
        .forEach((t) =>
          storeTodos.splice(store.todos.findIndex((t2) => t2.id === t.id))
        ),
        1;

      /* Then delete the list */
      const storeLists = selectLists(store);
      storeLists.splice(storeLists.findIndex((l) => l.id === listId, 1));
    },
    [lists, store]
  );

  const renameList = useCallback(
    (listId: string) => {
      const name = prompt("Enter a new name:");
      if (!name) return;
      const list = store.lists.find((l) => l.id === listId);
      list && (list.name = name);
      document.dispatchEvent(new Event("currentListNameChange"));
    },
    [store]
  );

  return (
    <Flex direction="column" h="100%">
      <Button my={10} onClick={createList}>
        Create List
      </Button>

      {/* Focus tasks */}
      <ListItem
        editable={false}
        focus
        selected={currentList === ListType.Focus}
        selectList={selectFocus}
      />

      {/* Uncategorized tasks */}
      <ListItem
        editable={false}
        selected={!currentList}
        selectList={selectList}
      />

      {sortedLists.map((list) => (
        <ListItem
          key={list.id}
          editable
          selected={list.id === currentList}
          listId={list.id}
          listName={list.name}
          renameList={renameList}
          deleteList={deleteList}
          selectList={selectList}
        />
      ))}
    </Flex>
  );
};
