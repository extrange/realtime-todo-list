import { Center, Divider, Flex, Stack, Text } from "@mantine/core";
import { differenceInCalendarDays } from "date-fns";
import React, { useMemo } from "react";
import { useAppStore } from "../appStore/appStore";
import {
	type DateFilter,
	type StateFilter,
	useSearchStore,
} from "../appStore/searchStore";
import type { Todo } from "../types/Todo";
import { SearchFilters } from "./SearchFilters";
import { SearchInput } from "./SearchInput";
import { SearchResultItem } from "./SearchResultItem";

const MAX_RESULTS = 100;
const UNCATEGORIZED_VALUE = "__uncategorized__";

function matchesStateFilter(todo: Todo, filter: StateFilter): boolean {
	switch (filter) {
		case "all":
			return true;
		case "active":
			return !todo.completed;
		case "completed":
			return todo.completed;
	}
}

function matchesDateFilter(todo: Todo, filter: DateFilter): boolean {
	if (filter === "all") return true;

	const today = new Date();

	switch (filter) {
		case "today":
			return (
				!!todo.dueDate &&
				differenceInCalendarDays(today, Date.parse(todo.dueDate)) === 0
			);
		case "thisWeek":
			return (
				!!todo.dueDate &&
				differenceInCalendarDays(Date.parse(todo.dueDate), today) >= 0 &&
				differenceInCalendarDays(Date.parse(todo.dueDate), today) <= 7
			);
		case "overdue":
			return (
				!!todo.dueDate &&
				differenceInCalendarDays(today, Date.parse(todo.dueDate)) > 0
			);
		case "noDueDate":
			return !todo.dueDate;
	}
}

function matchesListFilter(todo: Todo, selectedListIds: string[]): boolean {
	if (selectedListIds.length === 0) return true;
	const listId = todo.listId ?? UNCATEGORIZED_VALUE;
	return selectedListIds.includes(listId);
}

export const SearchResults = React.memo(() => {
	const searchQuery = useSearchStore((s) => s.searchQuery);
	const stateFilter = useSearchStore((s) => s.stateFilter);
	const dateFilter = useSearchStore((s) => s.dateFilter);
	const selectedListIds = useSearchStore((s) => s.selectedListIds);

	const searchIndex = useAppStore((s) => s.searchIndex);
	const allTodosMap = useAppStore((s) => s.allTodosMap);

	const results = useMemo((): Todo[] => {
		if (!searchIndex || !searchQuery.trim()) return [];

		const hits = searchIndex.search(searchQuery, {
			limit: MAX_RESULTS,
			enrich: true,
		});

		const idSet = new Set<string>();
		for (const hit of hits) {
			for (const id of hit.result) {
				if (typeof id === "string") idSet.add(id);
			}
		}

		const todos: Todo[] = [];
		for (const id of idSet) {
			if (todos.length >= MAX_RESULTS) break;
			const todo = allTodosMap.get(id);
			if (!todo) continue;
			if (!matchesStateFilter(todo, stateFilter)) continue;
			if (!matchesDateFilter(todo, dateFilter)) continue;
			if (!matchesListFilter(todo, selectedListIds)) continue;
			todos.push(todo);
		}

		return todos;
	}, [
		searchIndex,
		searchQuery,
		allTodosMap,
		stateFilter,
		dateFilter,
		selectedListIds,
	]);

	return (
		<Stack gap={0}>
			<Flex px="sm" py="xs">
				<SearchInput />
			</Flex>

			<Flex gap="xs" align="center" px="sm" py="xs" wrap="wrap">
				<SearchFilters />
			</Flex>

			<Divider />

			{searchQuery.trim() && results.length === 0 ? (
				<Center py="xl">
					<Text c="dimmed" fs="italic">
						No todos match your search
					</Text>
				</Center>
			) : (
				<Stack gap={0}>
					{results.map((todo) => (
						<SearchResultItem key={todo.id} todo={todo} />
					))}
				</Stack>
			)}
		</Stack>
	);
});

SearchResults.displayName = "SearchResults";
