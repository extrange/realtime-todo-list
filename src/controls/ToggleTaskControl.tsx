import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { IconListCheck } from "@tabler/icons-react";
import React, { useCallback } from "react";

export const ToggleTaskControl = React.memo(() => {
	const { editor } = useRichTextEditorContext();

	const onClick = useCallback(
		() => editor?.commands.toggleTaskList(),
		[editor],
	);
	return (
		<RichTextEditor.Control onClick={onClick} title="Task List">
			<IconListCheck size="1rem" stroke={1.5} />
		</RichTextEditor.Control>
	);
});
