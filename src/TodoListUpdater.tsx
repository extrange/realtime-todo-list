import { getYjsValue, observeDeep } from "@syncedstore/core";
import { differenceInCalendarDays } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";
import { YMapEvent, YXmlEvent } from "yjs";
import { YArray, YMap } from "yjs/dist/src/internals";
import { shallow } from "zustand/shallow";
import { ListType } from "./ListContext";
import { useAppStore } from "./appStore";
import { useCurrentList } from "./useCurrentList";
import { useProviderEvent } from "./useProviderEvent";
import { useStore } from "./useStore";
import { Todo } from "./useSyncedStore";
import { WithRequired, itemComparator } from "./util";

/**
 * Triggered when todos, list or currentList changes, ignoring text
 * change events.
 *
 * This loops through all todos once. This is much more performant
 * than filtering todos in each ListItem.
 */
export const TodoListUpdater = () => {
  const store = useStore();

  // We don't need reactivity, so we access store directly
  const lists = store.lists;
  const todos = store.todos;
  const [currentList] = useCurrentList();

  const synced = useProviderEvent("synced");

  const [
    setUncompletedTodos,
    setCompletedTodos,
    setUncompletedTodoIds,
    setUncompletedTodosCount,
    setDueTodos,
  ] = useAppStore(
    (state) => [
      state.setUncompletedTodos,
      state.setCompletedTodos,
      state.setUncompletedTodoIds,
      state.setUncompletedTodosCount,
      state.setDueTodos,
    ],
    shallow
  );

  const isFocusList = currentList === ListType.Focus;

  /* We only care when focus, completed, listId  and sortOrder change*/
  const todoItemKeysToCheck: Array<keyof Todo> = useMemo(
    () => [
      "focus",
      "completed",
      "listId",
      "sortOrder",
      "focusSortOrder",
      "dueDate",
    ],
    []
  );

  /* Place todos into categories.
  Will not appear in Profiler.*/
  const handleTodosUpdate = useCallback(
    (e?: Array<YMapEvent<Todo> | YXmlEvent>) => {
      const start = performance.now();
      if (e) {
        const shouldContinue =
          e.some((ev) =>
            todoItemKeysToCheck.some((k) =>
              (ev as YMapEvent<Todo>).keysChanged?.has(k)
            )
          ) ||
          e.some(
            (ev) =>
              /* Array add/remove */
              // TODO find a better way to type this
              (ev._changes as Record<string, Array<unknown>>)?.delta?.length &&
              // Ignore todo.content newline additions
              !(ev as unknown as Record<string, boolean>).childListChanged
          );
        if (!shouldContinue) return;
      }

      const uncompletedTodosCount = new Map([
        ["focus", 0],
        ["uncategorized", 0],
        ...lists.map((l) => [l.id, 0] as [string, number]),
      ]);

      const uncompletedTodos: Todo[] = [];
      const completedTodos: Todo[] = [];
      const dueTodos: WithRequired<Todo, "dueDate">[] = [];

      (getYjsValue(todos) as YArray<YMap<Todo[keyof Todo]>>).forEach(
        (t, idx) => {
          // Uncompleted todos
          if (!t.get("completed") as Todo["completed"]) {
            // Lists - uncompletedTodosCount

            // For Focus list
            if (t.get("focus") as Todo["focus"]) {
              const currentCount = uncompletedTodosCount.get("focus") || 0;
              uncompletedTodosCount.set("focus", currentCount + 1);
            }

            const listId = t.get("listId") as Todo["listId"];

            // For non-Focus lists and Uncategorized
            if (!listId) {
              const currentCount =
                uncompletedTodosCount.get("uncategorized") || 0;
              uncompletedTodosCount.set("uncategorized", currentCount + 1);
            } else {
              const currentCount = uncompletedTodosCount.get(listId) || 0;
              uncompletedTodosCount.set(listId, currentCount + 1);
            }

            // Due/overdue todos
            const dueDate = t.get("dueDate") as Todo["dueDate"];

            if (
              dueDate &&
              differenceInCalendarDays(new Date(), Date.parse(dueDate)) >= 0
            ) {
              // We push todos[idx] (the proxied object) instead of t (the yjs value), so we can listen to it later in components with useSyncedStore
              const todo = todos[idx] as WithRequired<Todo, "dueDate">;
              dueTodos.push(todo);

              /* Add due todos to the Focus/Due count
              If it was already a focus task, it would have been counted above */
              if (!t.get("focus") as Todo["focus"]) {
                const currentCount = uncompletedTodosCount.get("focus") || 0;
                uncompletedTodosCount.set("focus", currentCount + 1);
              }
            }
          }

          // Todos in Uncategorized and lists
          if ((t.get("listId") as Todo["listId"]) === currentList) {
            if (t.get("completed") as Todo["completed"])
              /* Push the syncedStore instance */
              completedTodos.push(todos[idx]);
            else uncompletedTodos.push(todos[idx]);
            // Focus list
          } else if (isFocusList && (t.get("focus") as Todo["focus"])) {
            if (t.get("completed") as Todo["completed"])
              /* Push the syncedStore instance */
              completedTodos.push(todos[idx]);
            else uncompletedTodos.push(todos[idx]);
          }
        }
      );

      // For 100 todos, sorting takes 1-2ms
      completedTodos.sort((a, b) => b.modified - a.modified);
      uncompletedTodos.sort(
        itemComparator(isFocusList ? "focusSortOrder" : "sortOrder")
      );
      setUncompletedTodos(uncompletedTodos);
      setCompletedTodos(completedTodos);
      setUncompletedTodoIds(uncompletedTodos.map((t) => t.id));
      setUncompletedTodosCount(uncompletedTodosCount);
      setDueTodos(dueTodos);
      console.log("TodoListUpdater", performance.now() - start);
    },
    [
      currentList,
      isFocusList,
      lists,
      setCompletedTodos,
      setDueTodos,
      setUncompletedTodoIds,
      setUncompletedTodos,
      setUncompletedTodosCount,
      todoItemKeysToCheck,
      todos,
    ]
  );

  useEffect(
    () => observeDeep(todos, handleTodosUpdate),
    [handleTodosUpdate, todos]
  );

  useEffect(
    () => observeDeep(lists, handleTodosUpdate),
    [handleTodosUpdate, lists]
  );

  /* On initial sync */
  useEffect(
    () => void (synced && handleTodosUpdate()),
    [handleTodosUpdate, synced]
  );

  return null;
};
