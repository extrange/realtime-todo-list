import { IconArrowBackUp } from "@tabler/icons-react";
import { createControl } from "./createControl";

export const UndoControl = createControl({
	title: "Undo",
	action: (editor) => () => editor.commands.undo(),
	icon: (editor) => (
		<IconArrowBackUp
			stroke={1.5}
			size="1rem"
			color={editor.can().undo() ? undefined : "grey"}
		/>
	),
});
