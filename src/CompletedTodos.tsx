import { Accordion } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { SetStateAction, useEffect, useState } from "react";
import { ListType } from "./ListContext";
import { TodoItemWrapper } from "./TodoItem/TodoItemWrapper";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";

type InputProps = {
  setEditingId: React.Dispatch<SetStateAction<string | undefined>>;
};

/**
 *
 * Completed tasks are:
 *
 * - sorted by last modified date, not user sortable
 * - dimmed
 * - shown as an accordion at bottom of task list
 * - not rendered unless opened explicitly
 */
export const CompletedTodos = React.memo(({ setEditingId }: InputProps) => {
  const store = useStore();
  const todos = useSyncedStore(store.todos);
  const [open, setOpen] = useState<string | null>(null);
  const [currentList] = useCurrentList();

  const todosInCurrentList = todos.filter(
    (t) =>
      t.completed &&
      (currentList === ListType.Focus ? t.focus : t.listId === currentList)
  );

  useEffect(() => setOpen(null), [currentList]);

  return (
    <Accordion
      value={open}
      onChange={setOpen}
      styles={{ content: { padding: 0 } }}
      chevronPosition="left"
    >
      <Accordion.Item value="completed">
        <Accordion.Control>
          Completed ({todosInCurrentList.length})
        </Accordion.Control>
        <Accordion.Panel>
          {/* Only render when open, to improve performance */}
          {open &&
            todosInCurrentList.map((t) => (
              <TodoItemWrapper todo={t} key={t.id} setEditingId={setEditingId} />
            ))}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
});
