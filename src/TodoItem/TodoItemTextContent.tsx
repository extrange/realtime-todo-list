import { Text, useMantineTheme } from "@mantine/core";
import { observeDeep } from "@syncedstore/core";
import React, { useCallback, useEffect, useState } from "react";
import type { Todo } from "../types/Todo";
import { getNotes, getTodoTitle } from "../util";
import classes from "./TodoItemTextContent.module.css";

type InputProps = {
	todo: Todo;
};

export const TodoItemTextContent = React.memo(({ todo }: InputProps) => {
	const theme = useMantineTheme();

	// Initial render
	const [title, setTitle] = useState<string>(() => getTodoTitle(todo));
	const [notes, setNotes] = useState<string>(() => getNotes(todo));

	const onChange = useCallback(() => {
		setTitle(getTodoTitle(todo));
		setNotes(getNotes(todo));
	}, [todo]);

	// Attach observers manually, since we are not using useSyncedStore here
	// (simply accessing todo.content will not trigger rerenders on change)
	useEffect(
		() => observeDeep(todo.content, onChange),
		[todo.content, onChange],
	);

	return (
		<Text
			component="div"
			className={classes.text}
			lineClamp={2}
			c={todo.completed ? "dimmed" : undefined}
		>
			<Text fs={title ? undefined : "italic"} c={!title ? "dimmed" : undefined}>
				{title || "(untitled)"}
			</Text>
			<Text
				fz={theme.fontSizes.sm}
				fs={title ? "italic" : undefined}
				c={"dimmed"}
			>
				{notes}
			</Text>
		</Text>
	);
});

TodoItemTextContent.displayName = "TodoItemTextContent";
