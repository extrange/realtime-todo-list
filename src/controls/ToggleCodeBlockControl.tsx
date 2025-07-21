import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { IconBraces } from "@tabler/icons-react";
import React, { useCallback } from "react";

export const ToggleCodeBlockControl = React.memo(() => {
	const { editor } = useRichTextEditorContext();

	const onClick = useCallback(
		() => editor?.commands.toggleCodeBlock(),
		[editor],
	);
	return (
		<RichTextEditor.Control onClick={onClick} title="Code Block">
			<IconBraces size="1rem" stroke={1.5} />
		</RichTextEditor.Control>
	);
});
