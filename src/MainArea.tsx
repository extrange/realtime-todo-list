import { useState } from "react";
import { EditTodoWrapper } from "./EditTodoWrapper";
import { TodoView } from "./TodoView";

/**
 * Conditionally shows either the todo list or the editor.
 *
 * Split for rendering performance.
 */
export const MainArea = () => {
  /* The todo currently being edited */
  const [editingId, setEditingId] = useState<string>();

  return editingId ? (
    <EditTodoWrapper editingId={editingId} setEditingId={setEditingId} />
  ) : (
    <TodoView setEditingId={setEditingId}/>
  );
};
