import { create } from "zustand";

interface Store {
  editingId?: string;
  setEditingId: (id?: string) => void;
  scrollPosition: Map<string, number>;
}

export const useStore = create<Store>()((set) => ({
  editingId: "",
  setEditingId: (id?: string) => set(() => ({ editingId: id })),
  scrollPosition: new Map(),
  setScrollPosition: (id: string, pos: number) =>
    set((state) => ({
      scrollPosition: { ...state.scrollPosition, [id]: pos },
    })),
}));
