import { notifications } from "@mantine/notifications";
import { differenceInCalendarDays } from "date-fns";
import { generateKeyBetween } from "fractional-indexing";
import sanitizeHtml from "sanitize-html";
import { v4 as uuidv4 } from "uuid";
import { User } from "./App";
import { colors } from "./constants";
import { Todo } from "./useSyncedStore";

type Sortable = {
  [T in keyof Pick<Todo, "focusSortOrder" | "sortOrder">]: string;
};

/**
 * Generate keys for all objects in an array, which don't already have keys.
 */
export const generateKeys = (todoOrListArray: Array<Partial<Sortable>>) =>
  // TODO: Sort array
  todoOrListArray.forEach((item, idx, arr) => {
    // In this method, todos may not yet have a sort order
    if (item.sortOrder) return;

    try {
      // First item, without key
      if (idx == 0) {
        item.sortOrder = generateKeyBetween(null, arr[idx + 1]?.sortOrder);
        return;
      }

      // Last item, without key
      if (idx == todoOrListArray.length) {
        item.sortOrder = generateKeyBetween(arr[idx - 1]?.sortOrder, null);
        return;
      }

      item.sortOrder = generateKeyBetween(
        arr[idx - 1]?.sortOrder,
        arr[idx + 1]?.sortOrder
      );
    } catch (e) {
      notifications.show({
        title: "Error generating sort keys",
        message: JSON.stringify(e),
        color: "red",
      });
    }
  });

/**
 * Generates a key in-between 2 Todos (or prior/after if either is undefined)
 *
 * If both Todos have the same ID (e.g. in collisions happening during offline sync), then change the sortOrder of the upper Todo to something just above it.
 *
 * Note: this may cause the upper todo to sometimes 'jump'. Also, while relative order of the 3 Todos will be preserved, their absolute order is not guaranteed. As a result, subsequent rearranging may result in subtle UI bugs.
 *
 * This scenario should hopefully be rare.
 *
 * Suboptimal, but works.
 */
export const generateKeyBetweenSafe = <T extends keyof Sortable>(
  a: Sortable | undefined,
  b: Sortable | undefined,
  sortKey: T
) => {
  console.log("a", a?.[sortKey]);
  console.log("b", b?.[sortKey]);
  try {
    return generateKeyBetween(a?.[sortKey], b?.[sortKey]);
  } catch (e) {
    // Only handle the case where the sortOrders are the same
    // The order looks weird because we sort by descending...
    if (a?.[sortKey] && b?.[sortKey] && a[sortKey] === b[sortKey]) {
      const upperKey = generateKeyBetween(b[sortKey], undefined);
      b[sortKey] = upperKey;
      return generateKeyBetween(a[sortKey], upperKey);
    }

    // Otherwise, throw
    throw new Error(`Error while generating sort keys: ${JSON.stringify(e)}`);
  }
};

/**
 * Sort an array of todos by descending lexicographical sort order.
 *
 * Todos without sortOrder will be compared equal.
 */
export const itemComparator =
  <T extends Sortable, K extends keyof Sortable>(sortKey: K) =>
  (a: T, b: T) => {
    const aSortKey = a[sortKey];
    const bSortKey = b[sortKey];
    if (!(aSortKey && bSortKey)) return 0;

    if (aSortKey > bSortKey) return -1;
    else if (aSortKey < bSortKey) return 1;
    else return 0;
  };

/**
 * Get the maximum sortOrder of a List or Todo array.
 */
export const getMaxSortOrder = <T extends keyof Sortable>(
  arr: Array<Sortable>,
  sortKey: T
) => {
  let max: string | undefined = undefined;

  arr
    .filter((t) => t[sortKey])
    .forEach((t) => {
      if (max === undefined) max = t[sortKey];
      else if ((t[sortKey] as string) > max) max = t[sortKey];
    });
  return max;
};

/**
 * Generate a random User.
 */
export const generateUser = (): User => ({
  name: `User ${uuidv4().slice(0, 6)}`,
  color: colors[Math.floor(Math.random() * colors.length)],
});

/**
 * Format storage sizes into human readable formats.
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**Identity function for memoization. */
export const identity = <T>(s: T): T => s;

/**Matches lowercase UUIDs. */
export const validateUuid = (uuid: string) =>
  !!uuid.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  );

/**Get the title of the todo, or undefined if none */
export const getTodoTitle = (todo: Todo) => {
  /* Empty todo. todoReadOnly.content could be non-empty, even
  if the Todo is really empty.*/
  if (!todo.content || !todo.content.length) return undefined;

  /* Note: both title and notes will count spaces as non-empty */
  return sanitizeHtml(todo.content.get(0).toString());
};

/**Check if the Todo has a focus property and focusSortOrder */
export const isFocusTodo = (
  todo: Todo
): todo is WithRequired<Todo, "focus" | "focusSortOrder"> =>
  !!todo.focus && !!todo.focusSortOrder;

/**Return T with properties in K marked as required. */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**Pretty-format a due date as follows:
 *
 * Today
 * Tomorrow
 * 3 days ago
 * In 2 days
 */
export const formatDueDate = (date: number, now: number = Date.now()) => {
  const daysToDue = differenceInCalendarDays(date, now);
  return (
    typeof daysToDue === "number" &&
    (daysToDue === 0
      ? "Today"
      : daysToDue === 1
      ? "Tomorrow"
      : daysToDue < 1
      ? `${Math.abs(daysToDue)} day${Math.abs(daysToDue) > 1 ? "s" : ""} ago`
      : `In ${daysToDue} days`)
  );
};
