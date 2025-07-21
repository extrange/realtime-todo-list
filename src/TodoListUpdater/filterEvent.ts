import type { YMapEvent, YXmlEvent } from "yjs";
import type { Todo } from "../types/Todo";

/**
 * Returns true if event has specified keys/is a todo addition/deletion.
 *
 * Ignores text change events (specifically newline events).
 */
export const eventHaskeys = (
	keysToCheck: Array<keyof Todo>,
	e: Array<YMapEvent<Todo> | YXmlEvent>,
): boolean => {
	const shouldContinue =
		e.some((ev) =>
			keysToCheck.some((k) => (ev as YMapEvent<Todo>).keysChanged?.has(k)),
		) ||
		e.some(
			(ev) =>
				/* Array add/remove */
				// TODO find a better way to type this
				(ev._changes as Record<string, Array<unknown>>)?.delta?.length &&
				// Ignore todo.content newline additions
				!(ev as unknown as Record<string, boolean>).childListChanged,
		);
	return shouldContinue;
};
