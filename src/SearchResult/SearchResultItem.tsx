import { Badge, Flex, Stack, Text, useMantineTheme } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { useCallback } from "react";
import { useAppStore } from "../appStore/appStore";
import { useSearchStore } from "../appStore/searchStore";
import { DueDateString } from "../DueDateString";
import type { Todo } from "../types/Todo";
import { useStore } from "../useStore";
import {
	getNotes,
	getSearchSnippet,
	getTodoFullNotes,
	getTodoTitle,
	hashToColor,
} from "../util";
import { HighlightedText } from "./HighlightedText";

type InputProps = {
	todo: Todo;
};

export const SearchResultItem = React.memo(({ todo: _todo }: InputProps) => {
	const todo = useSyncedStore(_todo);
	const theme = useMantineTheme();
	const store = useStore();
	const searchQuery = useSearchStore((s) => s.searchQuery);
	const setEditingTodo = useAppStore((s) => s.setEditingTodo);

	const onClick = useCallback(() => {
		setEditingTodo(todo);
	}, [setEditingTodo, todo]);

	const title = getTodoTitle(todo);
	const notes = getNotes(todo);
	const fullNotes = getTodoFullNotes(todo);
	const notesSnippet = fullNotes
		? getSearchSnippet(fullNotes, searchQuery)
		: "";

	const listName = todo.listId
		? (store.lists.find((l) => l.id === todo.listId)?.name ?? null)
		: null;

	const maxListNameLen = 20;
	const truncatedListName =
		listName && listName.length > maxListNameLen
			? `${listName.slice(0, maxListNameLen)}…`
			: listName;

	return (
		<Flex
			onClick={onClick}
			px="sm"
			py="xs"
			style={{
				cursor: "pointer",
				borderRadius: theme.radius.sm,
			}}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLElement).style.backgroundColor =
					"var(--mantine-color-default-hover)";
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLElement).style.backgroundColor = "";
			}}
		>
			<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
				<Text
					td={todo.completed ? "line-through" : undefined}
					c={todo.completed ? "dimmed" : undefined}
					style={{ wordBreak: "break-word" }}
				>
					{title ? (
						<HighlightedText text={title} query={searchQuery} />
					) : (
						<Text span fs="italic" c="dimmed">
							(untitled)
						</Text>
					)}
				</Text>

				{notes && (
					<Text
						size="sm"
						c="dimmed"
						lineClamp={2}
						style={{ wordBreak: "break-word" }}
					>
						<HighlightedText text={notesSnippet} query={searchQuery} />
					</Text>
				)}

				<Flex gap={4} align="center" wrap="wrap">
					{listName ? (
						<Badge
							variant="light"
							color={hashToColor(listName)}
							size="xs"
							title={listName}
						>
							{truncatedListName}
						</Badge>
					) : (
						!todo.listId && (
							<Badge variant="light" color="gray" size="xs">
								Uncategorized
							</Badge>
						)
					)}

					{todo.dueDate && (
						<Badge variant="outline" color="gray" size="xs">
							<DueDateString dueDate={todo.dueDate} />
						</Badge>
					)}
				</Flex>
			</Stack>
		</Flex>
	);
});

SearchResultItem.displayName = "SearchResultItem";
