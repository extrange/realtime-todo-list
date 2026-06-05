import { create } from "zustand";

export type DateFilter = "all" | "today" | "thisWeek" | "overdue" | "noDueDate";

export type StateFilter = "all" | "active" | "completed";

export type SearchStore = {
	searchQuery: string;
	setSearchQuery: (q: string) => void;

	isSearchOpen: boolean;
	openSearch: () => void;
	closeSearch: () => void;

	selectedListIds: string[];
	setSelectedListIds: (ids: string[]) => void;

	stateFilter: StateFilter;
	setStateFilter: (f: StateFilter) => void;

	dateFilter: DateFilter;
	setDateFilter: (f: DateFilter) => void;

	resetFilters: () => void;
};

export const useSearchStore = create<SearchStore>()((set) => ({
	searchQuery: "",
	setSearchQuery: (searchQuery) => set({ searchQuery }),

	isSearchOpen: false,
	openSearch: () =>
		set({ isSearchOpen: true, searchQuery: "", ...RESET_FILTERS }),
	closeSearch: () =>
		set({ isSearchOpen: false, searchQuery: "", ...RESET_FILTERS }),

	selectedListIds: [],
	setSelectedListIds: (selectedListIds) => set({ selectedListIds }),

	stateFilter: "all",
	setStateFilter: (stateFilter) => set({ stateFilter }),

	dateFilter: "all",
	setDateFilter: (dateFilter) => set({ dateFilter }),

	resetFilters: () => set({ ...RESET_FILTERS }),
}));

const RESET_FILTERS = {
	selectedListIds: [] as string[],
	stateFilter: "all" as StateFilter,
	dateFilter: "all" as DateFilter,
};
