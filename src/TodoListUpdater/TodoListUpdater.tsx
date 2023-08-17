import { getYjsValue, observeDeep } from "@syncedstore/core";
import { differenceInCalendarDays } from "date-fns";
import { useCallback, useEffect, useMemo } from "react";
import { YMapEvent, YXmlEvent } from "yjs";
import { YArray, YMap } from "yjs/dist/src/internals";
import { shallow } from "zustand/shallow";
import { useAppStore } from "../appStore/appStore";
import { TodosMap } from "../appStore/todoSlice";
import { useProviderEvent } from "../useProviderEvent";
import { useRerenderDaily } from "../useRerenderDaily";
import { useStore } from "../useStore";
import { Todo } from "../useSyncedStore";
import { WithRequired } from "../util";
import { eventHaskeys } from "./filterEvent";

/**
 * Updates todo lists in the Zustand store.
 *
 * Triggered when todos/lists change, ignoring text
 * change events. This loops through all todos once.
 * This is much more performant than filtering todos in each ListItem.
 *
 * Also triggered on initial sync, and daily at 12mn.
 *
 * Here, we run through todos in a single pass, sorting them
 * into their respective bins (focus, completed, etc).
 *
 * Downstream, in child components, other operations which
 * do not depend on the whole list are done (like sorting, filtering,
 * calculating counts).)
 */
export const TodoListUpdater = () => {
  const store = useStore();

  // We don't need reactivity
  const lists = store.lists;
  const todos = store.todos;

  // Used to trigger run on initial sync event
  const synced = useProviderEvent("synced");

  // Used to trigger a re-render daily at 12mn
  const time = useRerenderDaily();

  const [setTodosMap, setFocusTodos, setDueTodos, setUpcomingTodos] =
    useAppStore(
      (state) => [
        state.setTodosMap,
        state.setFocusTodos,
        state.setDueTodos,
        state.setUpcomingTodos,
      ],
      shallow
    );

  const todoItemKeysToCheck: Array<keyof Todo> = useMemo(
    () => [
      "focus",
      "completed",
      "listId",
      "dueDate",

      //Need to listen to sort orders, so that downstream sorting will be re-triggered (since zustand store is updated)
      "sortOrder",
      "focusSortOrder",
    ],
    []
  );

  /* Place todos into categories.
  Will not appear in React Profiler graph.*/
  const handleTodosUpdate = useCallback(
    (e?: Array<YMapEvent<Todo> | YXmlEvent>) => {
      /* If there is an event, only continue if it has required keys
      This function can also be called without an event (on list changes),
      so we also continue if there is no event.*/
      if (e && !eventHaskeys(todoItemKeysToCheck, e)) return;

      const start = performance.now();

      const todosMap: TodosMap = new Map([
        [undefined, { completed: [], uncompleted: [] }],
        ...lists.map(
          (l) =>
            [l.id, { completed: [], uncompleted: [] }] as [
              string,
              TodosMap extends Map<unknown, infer V> ? V : never
            ]
        ),
      ]);
      const focusTodos: Todo[] = [];
      const dueTodos: WithRequired<Todo, "dueDate">[] = [];
      const upcomingTodos: WithRequired<Todo, "dueDate">[] = [];

      /* Looping through the allTodos array is not expensive (1-2ms).
      - The expensive operation is the .get for the yjs map objects.
      - Approx 30ms for 3000 iterations.
      - toJSON() is even more expensive at 100ms+ for 3000 iterations. */

      (getYjsValue(todos) as YArray<YMap<Todo[keyof Todo]>>).forEach(
        (t, idx) => {
          const listId = t.get("listId") as Todo["listId"];

          const completed = t.get("completed") as Todo["completed"];

          // 1. Named and uncategorized lists
          todosMap
            .get(listId)
            ?.[completed ? "completed" : "uncompleted"].push(todos[idx]);

          // 2. Focus, uncompleted
          (t.get("focus") as Todo["focus"]) && focusTodos.push(todos[idx]);

          // 3. Due/overdue uncompleted
          const dueDate = t.get("dueDate") as Todo["dueDate"];
          !completed &&
            dueDate &&
            differenceInCalendarDays(new Date(), Date.parse(dueDate)) >= 0 &&
            dueTodos.push(todos[idx] as WithRequired<Todo, "dueDate">);

          // 4. Upcoming uncompleted
          !completed &&
            dueDate &&
            differenceInCalendarDays(new Date(), Date.parse(dueDate)) < 0 &&
            upcomingTodos.push(todos[idx] as WithRequired<Todo, "dueDate">);
        }
      );

      setTodosMap(todosMap);
      setFocusTodos(focusTodos);
      setDueTodos(dueTodos);
      setUpcomingTodos(upcomingTodos);
      console.log("TodoListUpdater", performance.now() - start);
    },
    [
      lists,
      setDueTodos,
      setFocusTodos,
      setTodosMap,
      setUpcomingTodos,
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

  // Rerender daily
  useEffect(
    () => void (time && handleTodosUpdate()),
    [handleTodosUpdate, time]
  );

  return null;
};
