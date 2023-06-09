import { Accordion } from "@mantine/core";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { ListType } from "./ListContext";
import { TodoItem } from "./TodoItem";
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
    () =>
      todos.filter(
        (t) =>
          t.completed &&
          (currentList === ListType.Focus ? t.focus : t.listId === currentList)
      ),
    [currentList, todos]
  );

  useEffect(() => setOpen(null), [currentList])

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
      chevronPosition="left"
    >
      <Accordion.Item value="completed">
        <Accordion.Control>Completed ({todoIds.length})</Accordion.Control>
        <Accordion.Panel>
          {/* Only render when open, to improve performance */}
          {open &&
            todoIds.map((id) => (
              <TodoItem
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
