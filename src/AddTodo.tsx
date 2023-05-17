import { Button } from "@mantine/core";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";
import { User } from "./App";
import { Todo, provider, store } from "./store";

type InputProps = {
  editingId: string;
  user: User;
  close: () => void;
};
export const AddTodo = ({ editingId, close, user }: InputProps) => {
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
      CollaborationCursor.configure({
        provider: provider,
        user,
      }),
    ],
    // This is necessary to cause a re-render...
    onUpdate: () => (todo.modified = Date.now()),
  });

  useEffect(() => {
    editor?.chain().updateUser(user).focus().run();
  }, [user, editor]);

  return (
    <>
      <EditorContent editor={editor} />
      <Button onClick={close}>Close</Button>
    </>
  );
};
