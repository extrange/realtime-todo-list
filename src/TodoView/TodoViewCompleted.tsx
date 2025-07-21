import { Accordion } from "@mantine/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "../appStore/appStore";
import type { TodoSlice } from "../appStore/todoSlice";
import { TodoItem } from "../TodoItem/TodoItem";
import type { Todo } from "../types/Todo";
import { useCurrentList } from "../useCurrentList";

/**Accordion of completed todos, unsortable */
export const TodoViewCompleted = React.memo(() => {
	const [open, setOpen] = useState<string | null>(null);
	const [currentList] = useCurrentList();

	const selectCompletedTodos = useCallback(
		(state: TodoSlice) => state.todosMap.get(currentList)?.completed as Todo[],
		[currentList],
	);
	const _completedTodos = useAppStore(selectCompletedTodos);

	// Sort by modified date, latest first
	const completedTodos = useMemo(
		() => _completedTodos.sort((a, b) => b.modified - a.modified),
		[_completedTodos],
	);

	// Default to close when changing lists
	useEffect(() => {
		if (currentList) setOpen(null);
	}, [currentList]);

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
