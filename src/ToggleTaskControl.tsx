import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { IconListCheck } from "@tabler/icons-react";
import { useCallback } from "react";

export const ToggleTaskControl = () => {
  const { editor } = useRichTextEditorContext();

  const onClick = useCallback(() => editor.commands.toggleTaskList(), [editor]);
  return (
    <RichTextEditor.Control onClick={onClick} title="Task List">
      <IconListCheck size="1rem" />
    </RichTextEditor.Control>
  );
};
