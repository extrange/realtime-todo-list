import { useSyncedStore } from "@syncedstore/react";
import { generateKeyBetween } from "fractional-indexing";
import React, { SetStateAction, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { ListType } from "./ListContext";
import { TodoViewBase } from "./TodoViewBase";
import { USER_ID } from "./constants";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { Todo } from "./useSyncedStore";
import { getMaxSortOrder, itemComparator } from "./util";

type InputProps = {
  setEditingId: React.Dispatch<SetStateAction<string | undefined>>;
};

/**Shows todos in selected, uncategorized or focus lists */
export const TodoView = React.memo(({ setEditingId }: InputProps) => {
  const [currentList] = useCurrentList();

  const store = useStore();
  const state = useSyncedStore(store);

  /* Can't debounce, otherwise the old sort order will flash on dragging end. */

  const isFocusList = useMemo(
    () => currentList === ListType.Focus,
    [currentList]
  );

  /* Determine Todos to show based on current list */
  const todosInCurrentList = state.todos.filter(
    (t) => (isFocusList ? t.focus : t.listId === currentList) && !t.completed
  );

  const sortedTodos = useMemo(
    () =>
      todosInCurrentList
        .slice()
        .sort(itemComparator(isFocusList ? "focusSortOrder" : "sortOrder")),
    [isFocusList, todosInCurrentList]
  );

  const createTodo = useCallback((): Todo => {
    const now = Date.now();
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(todosInCurrentList, "sortOrder"),
      undefined
    );

    const focusSortOrder = isFocusList
      ? generateKeyBetween(
          getMaxSortOrder(todosInCurrentList, "focusSortOrder"),
          undefined
        )
      : undefined;

    return {
      id: uuidv4(),
      completed: false,
      content: new XmlFragment(),
      created: now,
      modified: now,
      /* Focus tasks are created in Uncategorized */
      listId: isFocusList ? undefined : currentList,
      sortOrder,
      focus: isFocusList,
      focusSortOrder,
      by: USER_ID,
    };
  }, [currentList, isFocusList, todosInCurrentList]);

  return (
    <TodoViewBase
      setEditingId={setEditingId}
      todos={sortedTodos}
      createTodoFn={createTodo}
      sortKey={isFocusList ? "focusSortOrder" : "sortOrder"}
    />
  );
});
