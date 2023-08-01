import { Accordion } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { TodoItem } from "../TodoItem/TodoItem";
import { useAppStore } from "../appStore";

/**Due and overdue todos, unsortable. */
export const TodoViewDue = React.memo(() => {
  const [open, setOpen] = useState<string | null>("due");

  const dueTodos = useAppStore((state) => state.dueTodos);

  /* Since TodoViewDue only displays when 'Focus' is selected,
  this will be the current focus list. */
  const focusTodoIds = useAppStore((state) => state.uncompletedTodoIds);
  const focusTodoIdsSet = useMemo(() => new Set(focusTodoIds), [focusTodoIds]);

  // Don't show due todos which are already in focus
  const filteredDueTodos = useMemo(
    () => dueTodos.filter((t) => !focusTodoIdsSet.has(t.id)),
    [dueTodos, focusTodoIdsSet]
  );

  const styles = useMemo(() => ({ content: { padding: 0 } }), []);

  return (
    // Accordion is cheap (~3ms)
    <Accordion
      value={open}
      onChange={setOpen}
      styles={styles}
      chevronPosition="left"
    >
      <Accordion.Item value="due">
        <Accordion.Control>Due ({filteredDueTodos.length})</Accordion.Control>
        <Accordion.Panel>
          {open &&
            filteredDueTodos.map((t) => <TodoItem todo={t} key={t.id} />)}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
});
