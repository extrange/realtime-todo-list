import { Accordion } from "@mantine/core";
import React, { SetStateAction, useMemo, useState } from "react";
import { Task } from "./Task";
import { useCurrentList } from "./useCurrentList";
import { selectTodos, useSyncedStore } from "./useSyncedStore";

/* 
Completed tasks should:

be sorted by last modified date

not be sortable

be dimmed

accordion at bottom of task list
 */

type InputProps = {
  setEditingId: React.Dispatch<SetStateAction<string | undefined>>;
};

export const CompletedTodos = React.memo(({ setEditingId }: InputProps) => {
  const [open, setOpen] = useState<string | null>(null);
  const [currentList] = useCurrentList();

  const todos = useSyncedStore(selectTodos);

  const todosInCurrentList = useMemo(
    () => todos.filter((t) => t.listId === currentList && t.completed),
    [currentList, todos]
  );

  const sortedTodos = useMemo(
    () => todosInCurrentList.sort((a, b) => b.modified - a.modified),
    [todosInCurrentList]
  );

  const todoIds = useMemo(() => sortedTodos.map((t) => t.id), [sortedTodos]);

  return (
    <Accordion
      value={open}
      onChange={setOpen}
      styles={{ content: { padding: 0 } }}
    >
      <Accordion.Item value="completed">
        <Accordion.Control>Completed ({todoIds.length})</Accordion.Control>
        <Accordion.Panel>
            {/* Only render when open, to improve performance */}
          {open &&
            todoIds.map((id) => (
              <Task
                completed
                todoId={id}
                key={id}
                setEditingId={setEditingId}
              />
            ))}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
});
