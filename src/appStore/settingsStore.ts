import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  /**Hide todos with due dates, which are not due today */
  hideDueTodos: boolean;
  setHideDueTodos: (hide: boolean) => void;

  /**Hide repeating todos, but only if hideDueTodos is true */
  onlyHideRepeating: boolean;
  setOnlyHideRepeating: (onlyHideRepeating: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hideDueTodos: false,
      setHideDueTodos: (hideDueTodos) => set({ hideDueTodos }),
      onlyHideRepeating: false,
      setOnlyHideRepeating: (onlyHideRepeating) => set({ onlyHideRepeating }),
    }),
    { name: "settings" }
  )
);
