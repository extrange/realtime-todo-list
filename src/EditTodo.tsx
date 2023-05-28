import { useLocalStorage } from "@mantine/hooks";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "lodash";
import { useEffect, useMemo } from "react";
import { useStore } from "./stateStore";
import { Todo, provider, store } from "./store";
import { generateUser } from "./util";
import { Container } from "@mantine/core";

export const EditTodo = () => {
  const [user] = useLocalStorage({
    key: "user",
    defaultValue: generateUser(),
  });

  const editingId = useStore((store) => store.editingId);

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
    <Container>
      <EditorContent editor={editor} />
    </Container>
  );
};
