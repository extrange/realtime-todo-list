import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flex } from "@mantine/core";
import clsx from "clsx";
import React, { useMemo } from "react";
import { Todo } from "../types/Todo";
import { TodoItem } from "./TodoItem";
import classes from "./TodoItemWrapper.module.css";

export type TodoItemProps = {
	todo: Todo;

	/** Whether the Todo is being dragged */
	dragging?: boolean;
};

/**
 * This component is separated into 2 because of this issue.
 * https://github.com/clauderic/dnd-kit/issues/389#issuecomment-1013324147
 *
 * Essentially, when dragging, all the Sortables re-render unnecessarily.
 *
 * Heavy memoization helps somewhat, as the contents of the Todo don't rerender
 * (even if the container of the Todo does).
 */
export const TodoItemWrapper = React.memo((props: TodoItemProps) => {
	const { dragging, todo } = props;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: todo.id,
	});

	const style = useMemo(
		() =>
			({
				transform: CSS.Transform.toString(transform),
				transition,
			}) as React.CSSProperties,
		[transform, transition],
	);

	return (
		<Flex
			{...listeners}
			ref={setNodeRef}
			{...attributes}
			style={style}
			className={clsx({
				[classes.isDragging]: isDragging,
				[classes.dragging]: dragging,
				[classes.wrapper]: true,
			})}
		>
			<TodoItem {...props} />
		</Flex>
	);
});

TodoItemWrapper.displayName = "TodoItemWrapper";
