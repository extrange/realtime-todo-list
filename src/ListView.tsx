import { Button, Flex } from "@mantine/core";

import { useSyncedStore } from "@syncedstore/react";
import { generateKeyBetween } from "fractional-indexing";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "./appStore/appStore";
import { ListType } from "./ListContext";
import { ListItem } from "./ListItem";
import type { Todo } from "./types/Todo";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { selectLists, selectTodos } from "./useSyncedStore";
import { getMaxSortOrder } from "./util";

type CurrentListNameChange = "currentListNameChange";

declare global {
	interface Document {
		addEventListener<K extends CurrentListNameChange>(
			type: K,
			listener: (this: Document, ev: Event) => void,
		): void;
		removeEventListener<K extends CurrentListNameChange>(
			type: K,
			listener: (this: Document, ev: Event) => void,
		): void;
	}
}

type InputProps = {
	closeNav: () => void;
};

export const ListView = ({ closeNav }: InputProps) => {
	const store = useStore();
	const lists = useSyncedStore(store.lists);
	const [currentList, setCurrentList] = useCurrentList();

	const todosMap = useAppStore((state) => state.todosMap);
	const focusTodos = useAppStore((state) => state.focusTodos);
	const dueTodos = useAppStore((state) => state.dueTodos);

	/* Don't count due todos already in focus */
	const focusDueTodoCount = useMemo(
		() =>
			new Set([...focusTodos.map((t) => t.id), ...dueTodos.map((t) => t.id)])
				.size,
		[dueTodos, focusTodos],
	);

	/* Sort lists alphabetically
  Cost: ~5ms for 100 lists*/
	const sortedLists = lists
		.slice()
		.sort((a, b) => a.name.localeCompare(b.name));

	const createList = useCallback(() => {
		const name = prompt("Enter list name:");
		if (!name) return;
		const sortOrder = generateKeyBetween(
			getMaxSortOrder(lists, "sortOrder"),
			undefined,
		);
		const newListId = uuidv4();
		selectLists(store).push({ id: newListId, name: name, sortOrder });
		setCurrentList(newListId);
		closeNav();
	}, [closeNav, lists, setCurrentList, store]);

	/* Select Uncategorized/other lists with IDs */
	const selectList = useCallback(
		(listId?: string) => {
			setCurrentList(listId);
			closeNav();
		},
		[closeNav, setCurrentList],
	);

	const selectFocus = useCallback(() => {
		setCurrentList(ListType.Focus);
		closeNav();
	}, [closeNav, setCurrentList]);

	/* Deleting a list deletes all tasks the list, including completed tasks */
	const deleteList = useCallback(
		(listId: string) => {
			const name = lists.find((l) => l.id === listId)?.name;

			if (!confirm(`Delete '${name}'? This will delete all todos as well.`))
				return;

			/* First delete all the tasks in the list */
			const storeTodos = selectTodos(store);
			storeTodos
				.filter((t: Todo) => t.listId === listId)
				.forEach((t: Todo) => {
					storeTodos.splice(
						store.todos.findIndex((t2: Todo) => t2.id === t.id),
					);
				});

			/* Then delete the list */
			const storeLists = selectLists(store);
			storeLists.splice(storeLists.findIndex((l) => l.id === listId, 1));

			// Switch to Uncategorized
			setCurrentList(undefined);
		},
		[lists, setCurrentList, store],
	);

	const renameList = useCallback(
		(listId: string) => {
			const name = prompt("Enter a new name:");
			if (!name) return;
			const list = store.lists.find((l) => l.id === listId);
			if (list) {
				list.name = name;
			}
			document.dispatchEvent(new Event("currentListNameChange"));
		},
		[store],
	);

	return (
		<Flex direction="column" h="100%">
			<Button my={10} onClick={createList}>
				Create List
			</Button>

			{/* Focus tasks */}
			<ListItem
				editable={false}
				focus
				uncompletedTodosCount={focusDueTodoCount}
				selected={currentList === ListType.Focus}
				selectList={selectFocus}
			/>

			{/* Uncategorized tasks */}
			<ListItem
				editable={false}
				uncompletedTodosCount={todosMap.get(undefined)?.uncompleted.length ?? 0}
				selected={!currentList}
				selectList={selectList}
			/>

			{sortedLists.map((list) => (
				<ListItem
					key={list.id}
					editable
					uncompletedTodosCount={todosMap.get(list.id)?.uncompleted.length ?? 0}
					selected={list.id === currentList}
					list={list}
					renameList={renameList}
					deleteList={deleteList}
					selectList={selectList}
				/>
			))}
		</Flex>
	);
};
