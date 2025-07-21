import { createWithEqualityFn } from "zustand/traditional";
import { TodoSlice, createTodoSlice } from "./todoSlice";

type StoreState = TodoSlice;

export const useAppStore = createWithEqualityFn<StoreState>()((...args) => ({
	...createTodoSlice(...args),
}));
