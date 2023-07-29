/**
 * This is done for performance optimization, to avoid iterating
 * over the todos array twice (once in ListView and again in TodoView)
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Todo } from "./useSyncedStore";

type AppStore = {
  /**Map of <listId, uncompletedTodosCount> */
  uncompletedTodosCount: Map<string, number>;
  setUncompletedTodosCount: (counts: Map<string, number>) => void;

  /**Uncompleted todos in current list */
  uncompletedTodos: Todo[];
  setUncompletedTodos: (todos: Todo[]) => void;

  /**Uncompleted todo ids in current list */
  uncompletedTodoIds: string[];
  setUncompletedTodoIds: (ids: string[]) => void;

  /**Completed todos in current list */
  completedTodos: Todo[];
  setCompletedTodos: (todos: Todo[]) => void;

  editingTodo?: Todo;
  setEditingTodo: (todo?: Todo) => void;
};

export const useAppStore = create<AppStore>()(
  devtools((set) => ({
    uncompletedTodosCount: new Map(),
    setUncompletedTodosCount: (counts) =>
      set(() => ({ uncompletedTodosCount: counts })),

    completedTodos: [],
    setCompletedTodos: (todos) => set(() => ({ completedTodos: todos })),

    uncompletedTodos: [],
    setUncompletedTodos: (todos) => set(() => ({ uncompletedTodos: todos })),

    uncompletedTodoIds: [],
    setUncompletedTodoIds: (ids) => set(() => ({ uncompletedTodoIds: ids })),

    editingTodo: undefined,
    setEditingTodo: (todo) => set(() => ({ editingTodo: todo })),
  }))
);
