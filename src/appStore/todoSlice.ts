import { StateCreator } from "zustand";
import { Todo } from "../useSyncedStore";
import { WithRequired } from "../util";

/**
 * This is done for performance optimization, to avoid iterating
 * over the todos array twice (once in ListView and again in TodoView)
 */
export type TodoSlice = {
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

  /**Due and overdue todos */
  dueTodos: WithRequired<Todo, "dueDate">[];
  setDueTodos: (todos: WithRequired<Todo, "dueDate">[]) => void;
};

export const createTodoSlice: StateCreator<TodoSlice> = (set) => ({
  uncompletedTodosCount: new Map(),
  setUncompletedTodosCount: (uncompletedTodosCount) =>
    set({ uncompletedTodosCount }),

  completedTodos: [],
  setCompletedTodos: (completedTodos) => set({ completedTodos }),

  uncompletedTodos: [],
  setUncompletedTodos: (uncompletedTodos) => set({ uncompletedTodos }),

  uncompletedTodoIds: [],
  setUncompletedTodoIds: (uncompletedTodoIds) => set({ uncompletedTodoIds }),

  editingTodo: undefined,
  setEditingTodo: (editingTodo) => set({ editingTodo }),

  dueTodos: [],
  setDueTodos: (dueTodos) => set({ dueTodos }),
});
