import { getYjsValue, Y } from "@syncedstore/core";
import type { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { DEVELOPMENT, USER_ID } from "../constants";
import type { Store } from "../types/Store";
import type { Todo } from "../types/Todo";

export type ExportStoredUser = {
	user?: {
		name?: string;
		color?: string;
	};
	lastActive?: number;
};

export type ExportList = {
	name: string;
	id: string;
	sortOrder: string;
};

export type SerializedNode = {
	type: string;
	attrs?: Record<string, unknown>;
	children?: SerializedNode[];
	delta?: Array<{
		insert?: string;
		delete?: number;
		retain?: number;
		attributes?: Record<string, unknown>;
	}>;
	/** Backward compatibility: plain text for nodes without delta */
	text?: string;
};

export type ExportTodo = {
	id: string;
	sortOrder: string;
	completed?: boolean;
	modified?: number;
	by?: string;
	created?: number;
	content?: SerializedNode[];
	focus?: boolean;
	focusSortOrder?: string;
	listId?: string;
	dueDate?: string;
	repeatDays?: number;
};

export type ExportData = {
	lists?: ExportList[];
	todos?: ExportTodo[];
	storedUsers?: Record<string, ExportStoredUser>;
};

// biome-ignore lint/suspicious/noExplicitAny: yjs toArray callback type compat
function serializeNode(node: any): SerializedNode {
	if (node instanceof Y.XmlText) {
		const delta = node.toDelta();
		const result: SerializedNode = {
			type: "text",
			delta,
		};
		const attrs = node.getAttributes();
		if (Object.keys(attrs).length > 0) {
			result.attrs = attrs;
		}
		if (DEVELOPMENT) {
			console.debug("[export] XmlText", {
				delta: result.delta,
				attrs,
			});
		}
		return result;
	}
	if (node instanceof Y.XmlElement) {
		const children = node.toArray().map(serializeNode);
		const result: SerializedNode = {
			type: node.nodeName,
			children,
		};
		const attrs = node.getAttributes();
		if (Object.keys(attrs).length > 0) {
			result.attrs = attrs;
		}
		if (DEVELOPMENT) {
			console.debug("[export] XmlElement", {
				nodeName: node.nodeName,
				attrs,
				childCount: children.length,
			});
		}
		return result;
	}
	console.warn("[export] unexpected node type", node);
	return { type: "unknown", text: "" };
}

export function serializeTodoContent(todo: Todo): SerializedNode[] {
	const yMap = getYjsValue(todo) as Y.Map<unknown>;
	const content = yMap?.get("content");
	if (DEVELOPMENT) {
		console.debug("[export] content type", {
			isNull: content === null,
			isUndefined: content === undefined,
			instanceof: content instanceof Y.XmlFragment,
			constructor: content?.constructor?.name,
			// biome-ignore lint/suspicious/noExplicitAny: debug-only cast
			length: (content as any)?.length,
		});
	}
	if (!content || !(content instanceof Y.XmlFragment) || !content.length) {
		return [];
	}
	return content.toArray().map(serializeNode);
}

function deserializeNode(
	node: SerializedNode,
): Y.XmlText | Y.XmlElement | null {
	if (node.type === "text") {
		const yText = new Y.XmlText();

		if (node.delta && node.delta.length > 0) {
			// biome-ignore lint/suspicious/noExplicitAny: applyDelta accepts any delta array
			yText.applyDelta(node.delta as any);
		} else if (node.text !== undefined) {
			// Backward compatibility: plain text without delta
			yText.insert(0, node.text);
		}

		if (node.attrs) {
			for (const [key, value] of Object.entries(node.attrs)) {
				// biome-ignore lint/suspicious/noExplicitAny: yjs accepts any type at runtime
				yText.setAttribute(key, value as any);
			}
		}
		return yText;
	}

	const yEl = new Y.XmlElement(node.type);
	if (node.attrs) {
		for (const [key, value] of Object.entries(node.attrs)) {
			// biome-ignore lint/suspicious/noExplicitAny: yjs accepts any type at runtime
			yEl.setAttribute(key, value as any);
		}
	}
	if (node.children) {
		for (const child of node.children) {
			const yChild = deserializeNode(child);
			if (yChild) {
				yEl.insert(yEl.length, [yChild]);
			}
		}
	}
	return yEl;
}

function deserializeTodoContent(nodes: SerializedNode[]): Y.XmlFragment {
	const fragment = new Y.XmlFragment();
	if (!nodes?.length) return fragment;

	try {
		let idx = 0;
		for (const node of nodes) {
			const yNode = deserializeNode(node);
			if (yNode) {
				fragment.insert(idx, [yNode]);
				idx++;
			}
		}
		if (DEVELOPMENT) {
			console.debug("[import] reconstructed fragment", {
				length: fragment.length,
				// biome-ignore lint/suspicious/noExplicitAny: debug-only, toArray callback compat
				childTypes: fragment.toArray().map((c: any) => ({
					type:
						c instanceof Y.XmlText
							? "XmlText"
							: c instanceof Y.XmlElement
								? c.nodeName
								: "?",
					attrs:
						c instanceof Y.XmlText || c instanceof Y.XmlElement
							? c.getAttributes()
							: undefined,
				})),
			});
		}
	} catch (e) {
		console.error("Failed to deserialize todo content:", e);
	}

	return fragment;
}

export function exportData(store: MappedTypeDescription<Store>): ExportData {
	const storedUsersYMap = getYjsValue(store.storedUsers) as Y.Map<unknown>;
	const storedUsers: Record<string, ExportStoredUser> = {};
	// biome-ignore lint/suspicious/noExplicitAny: Y.Map<unknown> yields unknown values
	storedUsersYMap.forEach((value: any, key: string) => {
		storedUsers[key] = {
			user: value?.user
				? { name: value.user.name, color: value.user.color }
				: undefined,
			lastActive: value?.lastActive,
		};
	});

	return {
		lists: store.lists.map((l) => ({
			name: l.name,
			id: l.id,
			sortOrder: l.sortOrder,
		})),
		todos: store.todos.map((t) => ({
			id: t.id,
			sortOrder: t.sortOrder,
			completed: t.completed,
			modified: t.modified,
			by: t.by,
			created: t.created,
			content: serializeTodoContent(t),
			focus: t.focus,
			focusSortOrder: t.focusSortOrder,
			listId: t.listId,
			dueDate: t.dueDate,
			repeatDays: t.repeatDays,
		})),
		storedUsers,
	};
}

export function downloadJson(data: unknown, filename: string) {
	const jsonStr = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export async function importData(
	data: ExportData,
	store: MappedTypeDescription<Store>,
	progressCallback?: (p: number) => void,
) {
	const total =
		(data.lists?.length || 0) +
		(data.todos?.length || 0) +
		(data.storedUsers ? Object.keys(data.storedUsers).length : 0);
	let done = 0;

	const tick = async () => {
		done++;
		progressCallback?.(done / total);
		// Yield to the browser so React can render the progress bar
		await new Promise((resolve) => setTimeout(resolve, 0));
	};

	// Create lists first so that todo listId references are valid
	if (data.lists) {
		for (const list of data.lists) {
			if (store.lists.find((l) => l.id === list.id)) {
				await tick();
				continue;
			}
			store.lists.push({
				name: list.name,
				id: list.id,
				sortOrder: list.sortOrder,
			});
			await tick();
		}
	}

	// Then create todos
	if (data.todos) {
		for (const todo of data.todos) {
			if (store.todos.find((t) => t.id === todo.id)) {
				await tick();
				continue;
			}
			store.todos.push({
				id: todo.id,
				sortOrder: todo.sortOrder,
				completed: todo.completed ?? false,
				modified: todo.modified ?? Date.now(),
				by: todo.by ?? USER_ID,
				created: todo.created ?? Date.now(),
				content: deserializeTodoContent(todo.content ?? []),
				focus: todo.focus,
				focusSortOrder: todo.focusSortOrder,
				listId: todo.listId,
				dueDate: todo.dueDate,
				repeatDays: todo.repeatDays,
			});
			await tick();
		}
	}

	// Import stored users
	if (data.storedUsers) {
		for (const [id, userData] of Object.entries(data.storedUsers)) {
			if (store.storedUsers[id]) {
				await tick();
				continue;
			}
			store.storedUsers[id] = {
				user: userData.user,
				lastActive: userData.lastActive,
			};
			await tick();
		}
	}
}
