import { create } from "zustand";
import { persist } from "zustand/middleware";

/**This store is separate from the appStore because we want to persist this in localstorage */
export type SettingsStore = {
  /**
   * Whether to hide todos with due dates greater than a specified number
   * of days. Does not affect todos in Focus.*/
  hideDueTodos: boolean;
  setHideDueTodos: (hide: boolean) => void;

  /**
   * If hideDueTodos, hide todos due greater than these number of days
   *
   * Notes: It is okay to hide todos which have due dates, since they will
   * appear in upcoming/due in the future anyway. The number of hidden todos
   * will be indicated in each list.
   */
  hideDueTodosDays: number;
  setHideDueTodosDays: (days: number) => void;

  /**
   * Hide repeating todos not yet due. Does not affect todos in Focus.
   *
   * Notes: I considered putting them in a different list, however this doesn't
   * make a lot of sense logically. This option exists to further tighten the
   * 'Hide todos not due at most...' option, by being stricter for repeating
   * todos. Upcoming repeating todos can be seen in Focus/Due.
   */
  hideRepeating: boolean;
  setHideRepeating: (onlyHideRepeating: boolean) => void;

  /**Upcoming: show todos due at most x days away. x must be >= 1*/
  upcomingDays: number;
  setUpcomingDays: (days: number) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  //Save to localstorage
  persist(
    (set) => ({
      hideDueTodos: false,
      setHideDueTodos: (hideDueTodos) => set({ hideDueTodos }),
      hideDueTodosDays: 1,
      setHideDueTodosDays: (hideDueTodosDays) => set({ hideDueTodosDays }),
      hideRepeating: false,
      setHideRepeating: (hideRepeating) => set({ hideRepeating }),
      upcomingDays: 3,
      setUpcomingDays: (upcomingDays) => set({ upcomingDays }),
    }),
    { name: "settings" }
  )
);
