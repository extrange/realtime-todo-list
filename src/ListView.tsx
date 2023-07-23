import { Button, Flex } from "@mantine/core";

import { observeDeep } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";
import { generateKeyBetween } from "fractional-indexing";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { YMapEvent } from "yjs/dist/src/internals";
import { ListType } from "./ListContext";
import { ListItem } from "./ListItem";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { Todo, selectLists, selectTodos } from "./useSyncedStore";
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
  const state = useSyncedStore(store);
  const lists = state.lists;
  const todos = state.todos;
  const [uncompletedTodosCount, setUncompletedTodosCount] = useState<
    Map<string, number>
  >(new Map());
  const [currentList, setCurrentList] = useCurrentList();

  /* Sort lists alphabetically */
  const sortedLists = lists
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  /* Triggered when todos change, ignoring text change events
  This loops through all todos and generates the uncompletedCount.
  This is much more performant than filtering todos in each ListItem.*/
  const updateUncompletedCount = useCallback(
    (e?: Array<YMapEvent<Todo>>) => {
      if (e) {
        /* We only care when focus, completed and listId change*/
        const todoItemKeysToCheck: Array<keyof Todo> = [
          "focus",
          "completed",
          "listId",
        ];
        const shouldContinue =
          e.some((ev) =>
            todoItemKeysToCheck.some((k) => ev.keysChanged?.has(k))
          ) ||
          /* Array add/remove */
          e.some(
            (ev) =>
              // TODO find a better way to type this
              (ev._changes as Record<string, Array<unknown>>)?.delta?.length
          );
        if (!shouldContinue) return;
      }

      const temp = new Map([
        ["focus", 0],
        ["uncategorized", 0],
        ...lists.map((l) => [l.id, 0] as [string, number]),
      ]);

      todos.forEach((t) => {
        if (t.completed) return;
        if (t.focus) temp.set("focus", (temp.get("focus") as number) + 1);
        if (!t.listId)
          temp.set("uncategorized", (temp.get("uncategorized") as number) + 1);
        else temp.set(t.listId, (temp.get(t.listId) as number) + 1);
      });

      setUncompletedTodosCount(temp);
    },
    [lists, todos]
  );

  useEffect(
    () => observeDeep(todos, updateUncompletedCount),
    [updateUncompletedCount, todos]
  );

  const createList = useCallback(() => {
    const name = prompt("Enter list name:");
    if (!name) return;
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(lists, "sortOrder"),
      undefined
    );
    const newListId = uuidv4();
    selectLists(store).push({ id: newListId, name: name, sortOrder });
    setCurrentList(newListId);
    closeNav();
  }, [closeNav, lists, setCurrentList, store]);

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
        uncompletedTodosCount={uncompletedTodosCount.get("focus") || 0}
        selected={currentList === ListType.Focus}
        selectList={selectFocus}
      />

      {/* Uncategorized tasks */}
      <ListItem
        editable={false}
        uncompletedTodosCount={uncompletedTodosCount.get("uncategorized") || 0}
        selected={!currentList}
        selectList={selectList}
      />

      {sortedLists.map((list) => (
        <ListItem
          key={list.id}
          editable
          uncompletedTodosCount={uncompletedTodosCount.get(list.id) || 0}
          selected={list.id === currentList}
          list={list}
          renameList={renameList}
          deleteList={deleteList}
          selectList={selectList}
        />
      ))}
    </Flex>
  );
};
