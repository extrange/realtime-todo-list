import { notifications } from "@mantine/notifications";
import { generateKeyBetween } from "fractional-indexing";
import { v4 as uuidv4 } from "uuid";
import { User } from "./App";
import { colors } from "./constants";
import { List, Todo } from "./useSyncedStore";

type Sortable = Pick<Todo | List, "sortOrder">;

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
export const generateKeyBetweenSafe = (a?: Sortable, b?: Sortable) => {
  try {
    return generateKeyBetween(a?.sortOrder, b?.sortOrder);
  } catch (e) {
    // Only handle the case where the sortOrders are the same
    // The order looks weird because we sort by descending...
    if (a?.sortOrder && b?.sortOrder && a.sortOrder === b.sortOrder) {
      const upperKey = generateKeyBetween(b.sortOrder, undefined);
      b.sortOrder = upperKey;
      return generateKeyBetween(a.sortOrder, upperKey);
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
export const itemComparator = <T extends Sortable>(a: T, b: T) => {
  if (!(a.sortOrder && b.sortOrder)) return 0;

  if (a.sortOrder > b.sortOrder) return -1;
  else if (a.sortOrder < b.sortOrder) return 1;
  else return 0;
};

/**
 * Get the maximum sortOrder of a List or Todo array.
 */
export const getMaxSortOrder = (arr: Array<Sortable>) => {
  let max: string | undefined = undefined;

  arr
    .filter((t) => t.sortOrder)
    .forEach((t) => {
      if (max === undefined) max = t.sortOrder;
      else if ((t.sortOrder as string) > max) max = t.sortOrder;
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
