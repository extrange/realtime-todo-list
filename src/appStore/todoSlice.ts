import { StateCreator } from "zustand";
import { Todo } from "../useSyncedStore";
import { WithRequired } from "../util";

export type TodosMap = Map<
  string | undefined,
  {
    completed: Todo[];
    uncompleted: Todo[];
  }
>;

/**
 * This is done for performance optimization, to avoid iterating
 * over the todos array twice (once in ListView and again in TodoView)
 */
export type TodoSlice = {
  /**
   * Map of listId to `{completed, uncompleted}` todos.
   *
   * Uncategorized todos have a key of `undefined`.
   */
  todosMap: TodosMap;
  setTodosMap: (todosMap: TodosMap) => void;

  /**Due/overdue todos, across all lists, that are uncompleted*/
  dueTodos: WithRequired<Todo, "dueDate">[];
  setDueTodos: (todos: WithRequired<Todo, "dueDate">[]) => void;

  /**Focus todos, across all lists, that are uncompleted*/
  focusTodos: Todo[];
  setFocusTodos: (todos: Todo[]) => void;

  editingTodo?: Todo;
  setEditingTodo: (todo?: Todo) => void;
};

export const createTodoSlice: StateCreator<TodoSlice> = (set) => ({
  todosMap: new Map(),
  setTodosMap: (todosMap) => set({ todosMap }),

  dueTodos: [],
  setDueTodos: (dueTodos) => set({ dueTodos }),

  focusTodos: [],
  setFocusTodos: (focusTodos) => set({ focusTodos }),

  editingTodo: undefined,
  setEditingTodo: (editingTodo) => set({ editingTodo }),
});
