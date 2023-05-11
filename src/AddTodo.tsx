import { Button } from "@mantine/core";
import { Collaboration } from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Todo, store } from "./store";
import { useMemo } from "react";

type InputProps = {
  editingId: string;
  close: () => void;
};
export const AddTodo = ({ editingId, close }: InputProps) => {
  const todo = useMemo(
    () => store.todos.find((t) => t.id === editingId),
    [editingId]
  ) as Todo;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({
        fragment: todo?.content,
      }),
    ],
    // This is necessary to cause a re-render...
    onUpdate: () => (todo.modified = Date.now().toString()),
  });

  return (
    <>
      <EditorContent editor={editor} />
      <Button onClick={close}>Close</Button>
    </>
  );
};
