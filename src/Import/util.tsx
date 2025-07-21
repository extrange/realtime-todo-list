import { Y } from "@syncedstore/core";
import type { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { generateNKeysBetween } from "fractional-indexing";
import { v4 as uuidv4 } from "uuid";
import { USER_ID } from "../constants";
import type { Store } from "../types/Store";
import type { Todo } from "../types/Todo";
import { getMaxSortOrder } from "../util";
import type { UploadedTodoArray } from "./Import";

export const addUploadedTodos = (
	todos: UploadedTodoArray,
	store: MappedTypeDescription<Store>,
	currentListId: Todo["listId"],
	progressCallback: (p: number) => void = () => {},
) => {
	const sortKeys = generateNKeysBetween(
		getMaxSortOrder(
			store.todos.filter((t) => t.listId === currentListId),
			"sortOrder",
		),
		undefined,
		todos.length,
	).reverse();

	todos.forEach((t, idx) => {
		// Initialze default values
		const now = Date.now();
		const todoTitle = t.title || "";
		const todoNotes = t.notes || "";
		const todoCompleted = t.completed ?? false;
		const todoModified = t.modified || now;
		const todoCreated = t.created || now;

		// Create the todo
		const id = uuidv4();
		const content = new Y.XmlFragment();

		const title = new Y.XmlElement("title");
		title.setAttribute("level", "1");
		title.insert(0, [new Y.XmlText(todoTitle)]);
		content.insert(0, [title]);

		// Insert notes
		content.insert(
			1,
			todoNotes.split("\n").map((s) => {
				const paragraph = new Y.XmlElement("paragraph");
				paragraph.insert(0, [new Y.XmlText(s)]);
				return paragraph;
			}),
		);

		store.todos.push({
			id,
			sortOrder: sortKeys[idx],
			content,
			completed: todoCompleted,
			by: USER_ID,
			created: todoCreated,
			modified: todoModified,
			listId: currentListId,
		});

		// Update progress
		progressCallback(idx / todos.length);
	});
};
