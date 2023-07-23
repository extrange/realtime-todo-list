import { Profiler, useState } from "react";
import { EditTodoWrapper } from "./EditTodoWrapper";
import { TodoView } from "./TodoView";
import React from "react";

export const App = React.memo(() => {
  const [editingId, setEditingId] = useState<string>();

  return (
    <>
      <EditTodoWrapper editingId={editingId} setEditingId={setEditingId} />
      <Profiler
        id={"TodoView"}
        onRender={(id, phase, duration) =>
          duration > 5 && console.info(id, phase, duration)
        }
      >
        <TodoView setEditingId={setEditingId} />
      </Profiler>
    </>
  );
});
