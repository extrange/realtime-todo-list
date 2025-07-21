import { createWithEqualityFn } from "zustand/traditional";
import { createTodoSlice, type TodoSlice } from "./todoSlice";

type StoreState = TodoSlice;

export const useAppStore = createWithEqualityFn<StoreState>()((...args) => ({
	...createTodoSlice(...args),
}));
