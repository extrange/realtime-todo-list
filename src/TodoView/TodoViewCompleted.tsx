import { Accordion } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { TodoItem } from "../TodoItem/TodoItem";
import { useAppStore } from "../appStore/appStore";
import { useCurrentList } from "../useCurrentList";

/**Accordion of completed todos, unsortable */
export const TodoViewCompleted = React.memo(() => {
  const [open, setOpen] = useState<string | null>(null);
  const [currentList] = useCurrentList();

  const completedTodos = useAppStore((state) => state.completedTodos);

  // Default to close when changing lists
  useEffect(() => setOpen(null), [currentList]);

  return (
    // Accordion is cheap (~3ms)
    <Accordion
      value={open}
      onChange={setOpen}
      styles={{ content: { padding: 0 } }}
      chevronPosition="left"
    >
      <Accordion.Item value="completed">
        <Accordion.Control>
          Completed ({completedTodos.length})
        </Accordion.Control>
        <Accordion.Panel>
          {open && completedTodos.map((t) => <TodoItem todo={t} key={t.id} />)}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
});
