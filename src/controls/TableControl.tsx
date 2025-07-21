import {
	IconColumnInsertLeft,
	IconColumnInsertRight,
	IconRowInsertBottom,
	IconRowInsertTop,
	IconTableMinus,
	IconTablePlus,
} from "@tabler/icons-react";
import { RiDeleteColumn, RiDeleteRow } from "react-icons/ri";
import { createControl } from "./createControl";

export const TableControl = {
	/* Table */
	InsertTable: createControl({
		title: "Insert Table",
		action: (editor) => () =>
			editor
				.chain()
				.focus()
				.insertTable({ rows: 2, cols: 2, withHeaderRow: true })
				.run(),
		icon: <IconTablePlus stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().insertTable().run(),
	}),
	DeleteTable: createControl({
		title: "Delete Table",
		action: (editor) => () => editor.chain().focus().deleteTable().run(),
		icon: <IconTableMinus stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().deleteTable().run(),
	}),

	/* Rows */
	InsertRowBefore: createControl({
		title: "Insert Row Above",
		action: (editor) => () => editor.chain().focus().addRowBefore().run(),
		icon: <IconRowInsertTop stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().addRowBefore().run(),
	}),
	InsertRowAfter: createControl({
		title: "Insert Row Below",
		action: (editor) => () => editor.chain().focus().addRowAfter().run(),
		icon: <IconRowInsertBottom stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().addRowAfter().run(),
	}),
	DeleteRow: createControl({
		title: "Delete Row",
		action: (editor) => () => editor.chain().focus().deleteRow().run(),
		icon: <RiDeleteRow />,
		show: (editor) => editor.can().chain().focus().deleteRow().run(),
	}),

	/* Columns */
	InsertColumnLeft: createControl({
		title: "Insert Column to Left",
		action: (editor) => () => editor.chain().focus().addColumnBefore().run(),
		icon: <IconColumnInsertLeft stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().addColumnBefore().run(),
	}),
	InsertColumnRight: createControl({
		title: "Insert Column to Right",
		action: (editor) => () => editor.chain().focus().addColumnAfter().run(),
		icon: <IconColumnInsertRight stroke={1.5} size="1rem" />,
		show: (editor) => editor.can().chain().focus().addColumnAfter().run(),
	}),
	DeleteColumn: createControl({
		title: "Delete Column",
		action: (editor) => () => editor.chain().focus().deleteColumn().run(),
		icon: <RiDeleteColumn />,
		show: (editor) => editor.can().chain().focus().deleteColumn().run(),
	}),
};
