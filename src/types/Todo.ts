import type { XmlFragment } from "yjs";


export type Todo = {
  /**The content of the task, used by the TipTap editor. */
  content: XmlFragment;

  completed: boolean;

  /**UTC timestamp of the last modification. This includes
   * marking the task as completed. */
  modified: number;

  /**userId of the user who last modified this task. */
  by: string;

  /**UTC timestamp of when this todo was created. */
  created: number;

  id: string;

  /**A string used for lexicographical (fractional) sorting.
   * https://observablehq.com/@dgreensp/implementing-fractional-indexing
   */
  sortOrder: string;

  /**Whether this task should be in the 'Focus' view.*/
  focus?: boolean;

  /**Sort order for this task in the 'Focus' view.*/
  focusSortOrder?: string;

  /**UUID of the list this todo belongs to. */
  listId?: string;

  /**
   * Due date in ISO8601 (e.g. 2023-06-11). Parse with `Date.parse()`.
   *
   * Note: `Date.parse()` returns a date in **UTC** when giving a date-only
   * string.
   */
  dueDate?: string;

  /**Number of days the next dueDate is set after, when todo is marked
   * completed.
   */
  repeatDays?: number;
};
