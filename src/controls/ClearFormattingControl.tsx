import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { IconClearFormatting } from "@tabler/icons-react";
import { useCallback } from "react";

export const ClearFormattingControl = () => {
  const { editor } = useRichTextEditorContext();

  const onClick = useCallback(
    () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    [editor]
  );

  return (
    <RichTextEditor.Control onClick={onClick}>
      <IconClearFormatting size={"1rem"} stroke={1.5} />
    </RichTextEditor.Control>
  );
};
