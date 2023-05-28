import { Button } from "@mantine/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "lodash";
import { Todo, provider, store } from "./store";
import React, { useMemo, useEffect } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { generateUser } from "./util";

type InputProps = {
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const EditTodo = ({ editingId, setEditingId }: InputProps) => {
  const [user] = useLocalStorage({
    key: "user",
    defaultValue: generateUser(),
  });

  const todo = useMemo(
    () => store.todos.find((t) => t.id === editingId),
    [editingId]
  ) as Todo;

  const editor = useEditor({
    extensions: [
      TaskItem.configure({ nested: true }),
      TaskList,
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({ fragment: todo?.content }),
      CollaborationCursor.configure({ provider: provider, user }),
    ],
    editorProps: {
      handleTextInput: debounce(() => {
        todo.modified = Date.now();
        return false;
      }, 500),
    },
  });

  useEffect(() => {
    editor?.chain().updateUser(user).focus().run();
  }, [user, editor]);

  return (
    <>
      <EditorContent editor={editor} />
      <Button onClick={() => setEditingId(undefined)}>Close</Button>
    </>
  );
};
