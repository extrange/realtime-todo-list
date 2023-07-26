import React, { Profiler, useState } from "react";
import { EditTodoWrapper } from "./EditTodoWrapper";
import { TodoView } from "./TodoView";

export const AppBody = React.memo(() => {
  const [editingId, setEditingId] = useState<string>();

  return (
    <>
      <EditTodoWrapper editingId={editingId} setEditingId={setEditingId} />
      <Profiler
        id={"TodoView"}
        onRender={(id, phase, duration) =>
          duration > 15 && console.info(id, phase, duration)
        }
      >
        <TodoView setEditingId={setEditingId} />
      </Profiler>
    </>
  );
});

AppBody.displayName = 'AppBody'