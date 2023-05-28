import { create } from "zustand";

interface Store {
  editingId?: string;
  setEditingId: (id?: string) => void;
}

export const useStore = create<Store>()((set) => ({
  editingId: "",
  setEditingId: (id?: string) => set(() => ({ editingId: id })),
}));
