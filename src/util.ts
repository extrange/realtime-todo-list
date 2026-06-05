import { notifications } from "@mantine/notifications";
import { getYjsValue, Y } from "@syncedstore/core";
import { differenceInCalendarDays } from "date-fns";
import { generateKeyBetween } from "fractional-indexing";
import sanitizeHtml from "sanitize-html";
import { v4 as uuidv4 } from "uuid";
import { colors } from "./constants";
import type { Todo } from "./types/Todo";
import type { User } from "./types/User";

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
			if (idx === 0) {
				item.sortOrder = generateKeyBetween(null, arr[idx + 1]?.sortOrder);
				return;
			}

			// Last item, without key
			if (idx === todoOrListArray.length) {
				item.sortOrder = generateKeyBetween(arr[idx - 1]?.sortOrder, null);
				return;
			}

			item.sortOrder = generateKeyBetween(
				arr[idx - 1]?.sortOrder,
				arr[idx + 1]?.sortOrder,
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
	first: Sortable | undefined,
	second: Sortable | undefined,
	sortKey: T,
) => {
	try {
		return generateKeyBetween(first?.[sortKey], second?.[sortKey]);
	} catch (e) {
		// Only handle the case where the sortOrders are the same
		// The order looks weird because we sort by descending...
		if (
			first?.[sortKey] &&
			second?.[sortKey] &&
			first[sortKey] === second[sortKey]
		) {
			const upperKey = generateKeyBetween(second[sortKey], undefined);
			second[sortKey] = upperKey;
			return generateKeyBetween(first[sortKey], upperKey);
		}

		// Otherwise, throw
		throw new Error(
			`Error while generating sort keys for ${JSON.stringify(
				first,
			)} and ${JSON.stringify(second)} : ${JSON.stringify(e)}`,
		);
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
	sortKey: T,
) => {
	let max: string | undefined;

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

	return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Extract plain text from a raw Y.Map's "content" field for indexing.
 * Bypasses SyncedStore proxy overhead — works with Y.Map directly.
 */
export const getTodoSearchText = (yMap: Y.Map<unknown>): string => {
	const content = yMap.get("content");
	if (!content || !(content instanceof Y.XmlFragment) || !content.length)
		return "";
	return content.toArray().map(getPlainText).join(" ").toLowerCase();
};

/**
 * Given full text and a search query, return a snippet centred around the
 * first match, with surrounding context words.
 */
export const getSearchSnippet = (
	text: string,
	query: string,
	contextChars = 50,
): string => {
	const trimmed = query.trim();
	if (!trimmed) return text;

	const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

	if (terms.length === 0 || !text) return text;

	const lower = text.toLowerCase();
	let matchStart = -1;
	let matchEnd = -1;

	for (const term of terms) {
		const idx = lower.indexOf(term);
		if (idx !== -1 && (matchStart === -1 || idx < matchStart)) {
			matchStart = idx;
			matchEnd = idx + term.length;
		}
	}

	if (matchStart === -1) {
		return text.length > contextChars * 2
			? `${text.slice(0, contextChars * 2)}…`
			: text;
	}

	const matchCenter = Math.floor((matchStart + matchEnd) / 2);
	let start = Math.max(0, matchCenter - contextChars);
	let end = Math.min(text.length, matchCenter + contextChars);

	if (start > 0) {
		const space = text.indexOf(" ", start);
		if (space !== -1 && space < matchStart) start = space + 1;
	}

	if (end < text.length) {
		const space = text.lastIndexOf(" ", end);
		if (space !== -1 && space > matchEnd) end = space;
	}

	const prefix = start > 0 ? "…" : "";
	const suffix = end < text.length ? "…" : "";

	return `${prefix}${text.slice(start, end)}${suffix}`;
};

/**Identity function for memoization. */
export const identity = <T>(s: T): T => s;

/**Matches lowercase UUIDs. */
export const validateUuid = (uuid: string) =>
	!!uuid.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
	);

/**
 * Extract plain text from a Y.XmlText or Y.XmlElement node without
 * any XML markup. Unlike toString(), this does not include inline
 * element tags like <code>, <link>, or <strike>.
 */
// biome-ignore lint/suspicious/noExplicitAny: yjs toArray callback type compat
function getPlainText(node: any): string {
	if (node instanceof Y.XmlText) {
		return (
			node
				.toDelta()
				// biome-ignore lint/suspicious/noExplicitAny: toDelta returns any[]
				.filter((d: any) => typeof d.insert === "string")
				// biome-ignore lint/suspicious/noExplicitAny: toDelta returns any[]
				.map((d: any) => d.insert)
				.join("")
		);
	}
	if (node instanceof Y.XmlElement) {
		return node.toArray().map(getPlainText).join(" ");
	}
	return "";
}

/**Get the title of the todo*/
export const getTodoTitle = (todo: Todo) => {
	/*The XmlFragment can be viewed as an array.

    The title is the 0th element, and any notes are from index 1 onward.

    The toJSON representation of the XmlFragment however, could contain
    XML tags such as <title> even if empty (such as a todo which is created,
    then subsequently cleared). It is therefore not reliable to check if
    todo.content is empty, when determining if the fragment is empty.

    So, to check if it is empty, we check the length of the XmlFragment.

    To check for the title, we check if there is a first element. The first element will always be the title, even if it is blank.*/

	/* Empty todo. todoReadOnly.content could be non-empty, even
  if the Todo is really empty.*/
	if (!todo.content?.length) return "";

	const yMap = getYjsValue(todo) as Y.Map<unknown>;
	const content = yMap?.get("content");
	if (!content || !(content instanceof Y.XmlFragment) || !content.length) {
		return "";
	}

	/* Note: both title and notes will count spaces as non-empty */
	return sanitizeHtml(getPlainText(content.toArray()[0]));
};

export const getNotes = (todo: Todo) => {
	const yMap = getYjsValue(todo) as Y.Map<unknown>;
	const content = yMap?.get("content");
	if (!content || !(content instanceof Y.XmlFragment)) return "";

	/* Take at most 300 chars of the todo's notes */
	const notesArray: string[] = [];
	content
		.toArray()
		.slice(1)
		.every((e) => {
			notesArray.push(sanitizeHtml(getPlainText(e)));
			return notesArray.join(" ").length < 200;
		});
	return notesArray.join(" ");
};

/** Get the full notes text of a todo without the 200-char display limit. */
export const getTodoFullNotes = (todo: Todo) => {
	const yMap = getYjsValue(todo) as Y.Map<unknown>;
	const content = yMap?.get("content");
	if (!content || !(content instanceof Y.XmlFragment)) return "";

	const notesArray: string[] = [];
	content
		.toArray()
		.slice(1)
		.forEach((e) => {
			notesArray.push(sanitizeHtml(getPlainText(e)));
		});
	return notesArray.join(" ");
};

/**Check if the Todo has a focus property and focusSortOrder */
export const isFocusTodo = (
	todo: Todo,
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

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**Show 'just now' for durations < 1min ago */
export const reactTimeAgoFormatter = (
	value: number,
	unit: string,
	suffix: string,
) => {
	if (unit === "second") {
		return "just now";
	}
	return `${value} ${unit}${value !== 1 ? "s" : ""} ${suffix}`;
};

/**
 * Deterministically hash a string to an HSL color.
 * Same input always produces the same color, so all clients see
 * consistent list colors without storing them.
 *
 * Uses lightness 40% for sufficient contrast as text on light variant
 * badges, and saturation 55% for distinct but not garish colors.
 */
export const hashToColor = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // 32-bit
	}
	const hue = Math.abs(hash % 360);
	return `oklch(70% 0.18 ${hue})`;
};
