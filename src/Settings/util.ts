import { differenceInCalendarDays } from "date-fns";
import { SettingsStore } from "../appStore/settingsStore";
import { Todo } from "../useSyncedStore";

type Params = {
  todos: Todo[];
  settings: SettingsStore;
};

/**
 * Filter todos based on settings.
 * 
 * Not applicable to the Focus list (focus todos will always be shown).
 *
 * Each setting is applied stepwise, and any setting which filters out the todo
 * will trump all other filters.
 */
export const filterTodosBasedOnSettings = ({ todos, settings }: Params) => {
  const { hideDueTodos, hideRepeating, hideDueTodosDays } = settings;

  return todos.filter((t) => {
    /* Start by showing all todos by default. Subsquently, this can
    only be set to false, never back to true. */
    let shouldShow = true;

    if (hideDueTodos) {
      const dueDate = t.dueDate;
      if (dueDate) {
        shouldShow =
          shouldShow &&
          differenceInCalendarDays(Date.parse(dueDate), new Date()) <=
            hideDueTodosDays;
      }
    }

    if (hideRepeating) {
      const repeatDays = t.repeatDays;
      const dueDate = t.dueDate; // The repeating todo must have a due date
      if (repeatDays && dueDate) {
        //Only show if due today/overdue
        shouldShow =
          shouldShow &&
          differenceInCalendarDays(new Date(), Date.parse(dueDate)) >= 0;
      }
    }

    return shouldShow;
  });
};
