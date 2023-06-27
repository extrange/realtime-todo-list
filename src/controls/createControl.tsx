import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { Editor } from "@tiptap/react";

type InputProps = {
  title: string;
  action: (editor: Editor) => React.MouseEventHandler<HTMLButtonElement>;

  /**Pass a function to conditionally add styles to the icon */
  icon: JSX.Element | ((editor: Editor) => JSX.Element);

  /**Whether to show the control (default always) */
  show?: (editor: Editor) => boolean;
};

export const createControl =
  ({ title, action, icon, show = () => true }: InputProps) =>
  () => {
    const { editor } = useRichTextEditorContext();

    return editor && show(editor) ? (
      <RichTextEditor.Control title={title} onClick={action(editor)}>
        {typeof icon === "function" ? icon(editor) : icon}
      </RichTextEditor.Control>
    ) : null;
  };
