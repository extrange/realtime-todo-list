import { notifications } from "@mantine/notifications";
import { generateKeyBetween } from "fractional-indexing";
import { v4 as uuidv4 } from "uuid";
import { Todo } from "./store";
import { colors } from "./constants";

/**
 * Generate keys for all objects in an array, which don't already have keys.
 */
export const generateKeys = (todoArray: Todo[]) =>
  // TODO: Sort array
  todoArray.forEach((todo, idx, arr) => {
    // In this method, todos may not yet have a sort order
    if (todo.sortOrder) return;

    try {
      // First item, without key
      if (idx == 0) {
        todo.sortOrder = generateKeyBetween(null, arr[idx + 1]?.sortOrder);
        return;
      }

      // Last item, without key
      if (idx == todoArray.length) {
        todo.sortOrder = generateKeyBetween(arr[idx - 1]?.sortOrder, null);
        return;
      }

      todo.sortOrder = generateKeyBetween(
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
 * Clean duplicate and invalid keys from an array.
 *
 * Run this before `generateKeys`.
 */
export const cleanKeys = () => {
  //TODO Test with duplicate keys, invalid keys
  // Test two clients creating two items with same index while offline
  // Order should be preserved
};

/**
 * Sort an array of todos lexicographically, in descending order.
 *
 * Todos without sortOrder will be compared equal.
 */
export const todoComparator = (a: Todo, b: Todo) => {
  if (!(a.sortOrder && b.sortOrder)) return 0;

  if (a.sortOrder > b.sortOrder) return -1;
  else if (a.sortOrder < b.sortOrder) return 1;
  else return 0;
};

/**
 * Get the maximum sortOrder of a Todo[].
 */
export const getMaxSortOrder = (arr: Todo[]) => {
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
 * Generate a random user if not initialized.
 */
export const generateUser = () => ({
  name: `User ${uuidv4().slice(0, 6)}`,
  color: colors[Math.floor(Math.random() * colors.length)],
});
