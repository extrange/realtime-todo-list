import { getYjsValue, observeDeep, type Y } from "@syncedstore/core";
import { differenceInCalendarDays } from "date-fns";
import { Document } from "flexsearch";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { YMapEvent, YXmlEvent } from "yjs";
import type { YArray, YMap } from "yjs/dist/src/internals";
import { shallow } from "zustand/shallow";
import { useAppStore } from "../appStore/appStore";
import type { TodosMap } from "../appStore/todoSlice";
import type { Todo } from "../types/Todo";
import { useProviderEvent } from "../useProviderEvent";
import { useRerenderDaily } from "../useRerenderDaily";
import { useStore } from "../useStore";
import { getTodoSearchText, type WithRequired } from "../util";
import { eventHaskeys } from "./filterEvent";

const createSearchIndex = () =>
	new Document({
		document: {
			id: "id",
			index: ["text"],
		},
		tokenize: "forward",
		cache: true,
		context: true,
	});

/**
 * Updates todo lists in the Zustand store.
 *
 * Triggered when todos/lists change, ignoring text
 * change events. This loops through all todos once.
 * This is much more performant than filtering todos in each ListItem.
 *
 * Also triggered on initial sync, and daily at 12mn.
 *
 * Here, we run through todos in a single pass, sorting them
 * into their respective bins (focus, completed, etc).
 *
 * Downstream, in child components, other operations which
 * do not depend on the whole list are done (like sorting, filtering,
 * calculating counts).)
 */
export const TodoListUpdater = () => {
	const store = useStore();

	const lists = store.lists;
	const todos = store.todos;

	const synced = useProviderEvent("synced");

	const time = useRerenderDaily();

	const [
		setTodosMap,
		setFocusTodos,
		setDueTodos,
		setUpcomingTodos,
		setAllTodosMap,
		setSearchIndex,
		setIsRebuildingIndex,
	] = useAppStore(
		(state) => [
			state.setTodosMap,
			state.setFocusTodos,
			state.setDueTodos,
			state.setUpcomingTodos,
			state.setAllTodosMap,
			state.setSearchIndex,
			state.setIsRebuildingIndex,
		],
		shallow,
	);

	const searchIndexRef = useRef<Document>(createSearchIndex());

	const rebuildSearchIndex = useCallback(() => {
		setIsRebuildingIndex(true);
		try {
			const rawTodos = getYjsValue(todos) as YArray<YMap<Todo[keyof Todo]>>;
			const newIndex = createSearchIndex();
			const allTodosMap = new Map<string, Todo>();

			rawTodos.forEach((yMap, idx) => {
				const todo = todos[idx];
				allTodosMap.set(todo.id, todo);

				const text = getTodoSearchText(yMap as Y.Map<unknown>);
				if (text) {
					newIndex.add(todo.id, { id: todo.id, text });
				}
			});

			searchIndexRef.current = newIndex;
			setAllTodosMap(allTodosMap);
			setSearchIndex(newIndex);
		} finally {
			setIsRebuildingIndex(false);
		}
	}, [todos, setAllTodosMap, setSearchIndex, setIsRebuildingIndex]);

	const debouncedRebuild = useMemo(
		() =>
			debounce(() => {
				if (useAppStore.getState().editingTodo) return;
				rebuildSearchIndex();
			}, 300),
		[rebuildSearchIndex],
	);

	useEffect(() => {
		const unsub = useAppStore.subscribe((state, prevState) => {
			if (prevState.editingTodo && !state.editingTodo) {
				debouncedRebuild.cancel();
				rebuildSearchIndex();
			}
		});
		return unsub;
	}, [debouncedRebuild, rebuildSearchIndex]);

	const todoItemKeysToCheck: Array<keyof Todo> = useMemo(
		() => [
			"focus",
			"completed",
			"listId",
			"dueDate",
			"sortOrder",
			"focusSortOrder",
		],
		[],
	);

	const handleTodosUpdate = useCallback(
		(e?: Array<YMapEvent<Todo> | YXmlEvent>) => {
			if (e && !eventHaskeys(todoItemKeysToCheck, e)) {
				debouncedRebuild();
				return;
			}

			const start = performance.now();

			const todosMap: TodosMap = new Map([
				[undefined, { completed: [], uncompleted: [] }],
				...lists.map(
					(l) =>
						[l.id, { completed: [], uncompleted: [] }] as [
							string,
							TodosMap extends Map<unknown, infer V> ? V : never,
						],
				),
			]);
			const focusTodos: Todo[] = [];
			const dueTodos: WithRequired<Todo, "dueDate">[] = [];
			const upcomingTodos: WithRequired<Todo, "dueDate">[] = [];

			const rawTodos = getYjsValue(todos) as YArray<YMap<Todo[keyof Todo]>>;

			rawTodos.forEach((t, idx) => {
				const listId = t.get("listId") as Todo["listId"];

				const completed = t.get("completed") as Todo["completed"];

				todosMap
					.get(listId)
					?.[completed ? "completed" : "uncompleted"].push(todos[idx]);

				!completed &&
					(t.get("focus") as Todo["focus"]) &&
					focusTodos.push(todos[idx]);

				const dueDate = t.get("dueDate") as Todo["dueDate"];
				!completed &&
					dueDate &&
					differenceInCalendarDays(new Date(), Date.parse(dueDate)) >= 0 &&
					dueTodos.push(todos[idx] as WithRequired<Todo, "dueDate">);

				!completed &&
					dueDate &&
					differenceInCalendarDays(new Date(), Date.parse(dueDate)) < 0 &&
					upcomingTodos.push(todos[idx] as WithRequired<Todo, "dueDate">);
			});

			setTodosMap(todosMap);
			setFocusTodos(focusTodos);
			setDueTodos(dueTodos);
			setUpcomingTodos(upcomingTodos);

			rebuildSearchIndex();

			console.log("TodoListUpdater", performance.now() - start);
		},
		[
			lists,
			setDueTodos,
			setFocusTodos,
			setTodosMap,
			setUpcomingTodos,
			todoItemKeysToCheck,
			todos,
			debouncedRebuild,
			rebuildSearchIndex,
		],
	);

	useEffect(
		() => observeDeep(todos, handleTodosUpdate),
		[handleTodosUpdate, todos],
	);

	useEffect(
		() => observeDeep(lists, handleTodosUpdate),
		[handleTodosUpdate, lists],
	);

	useEffect(
		() => void (synced && handleTodosUpdate()),
		[handleTodosUpdate, synced],
	);

	useEffect(
		() => void (time && handleTodosUpdate()),
		[handleTodosUpdate, time],
	);

	return null;
};
