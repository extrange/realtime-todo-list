import { MultiSelect, SegmentedControl } from "@mantine/core";
import React, { useMemo } from "react";
import {
	type DateFilter,
	type StateFilter,
	useSearchStore,
} from "../appStore/searchStore";
import { useStore } from "../useStore";

const UNCATEGORIZED_VALUE = "__uncategorized__";

const DATE_OPTIONS: { label: string; value: DateFilter }[] = [
	{ label: "All", value: "all" },
	{ label: "Today", value: "today" },
	{ label: "This Week", value: "thisWeek" },
	{ label: "Overdue", value: "overdue" },
	{ label: "No Due Date", value: "noDueDate" },
];

const STATE_OPTIONS: { label: string; value: StateFilter }[] = [
	{ label: "All", value: "all" },
	{ label: "Active", value: "active" },
	{ label: "Completed", value: "completed" },
];

export const SearchFilters = React.memo(() => {
	const store = useStore();

	const stateFilter = useSearchStore((s) => s.stateFilter);
	const setStateFilter = useSearchStore((s) => s.setStateFilter);

	const dateFilter = useSearchStore((s) => s.dateFilter);
	const setDateFilter = useSearchStore((s) => s.setDateFilter);

	const selectedListIds = useSearchStore((s) => s.selectedListIds);
	const setSelectedListIds = useSearchStore((s) => s.setSelectedListIds);

	const listData = useMemo(
		() => [
			{ value: UNCATEGORIZED_VALUE, label: "Uncategorized" },
			...store.lists.map((l) => ({ value: l.id, label: l.name })),
		],
		[store.lists],
	);

	return (
		<>
			<MultiSelect
				data={listData}
				value={selectedListIds}
				onChange={setSelectedListIds}
				placeholder="All lists"
				clearable
				searchable
				size="xs"
				styles={{ root: { flex: 1 } }}
			/>

			<SegmentedControl
				data={STATE_OPTIONS.map((o) => o.label)}
				value={
					STATE_OPTIONS.find((o) => o.value === stateFilter)?.label ?? "All"
				}
				onChange={(label) => {
					const opt = STATE_OPTIONS.find((o) => o.label === label);
					if (opt) setStateFilter(opt.value);
				}}
				size="xs"
			/>

			<SegmentedControl
				data={DATE_OPTIONS.map((o) => o.label)}
				value={DATE_OPTIONS.find((o) => o.value === dateFilter)?.label ?? "All"}
				onChange={(label) => {
					const opt = DATE_OPTIONS.find((o) => o.label === label);
					if (opt) setDateFilter(opt.value);
				}}
				size="xs"
			/>
		</>
	);
});

SearchFilters.displayName = "SearchFilters";
