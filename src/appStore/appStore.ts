import { create } from "zustand";
import { TodoSlice, createTodoSlice } from "./todoSlice";

type StoreState = TodoSlice;

export const useAppStore = create<StoreState>()((...args) => ({
  ...createTodoSlice(...args),
}));
