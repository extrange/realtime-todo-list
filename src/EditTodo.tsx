import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { User } from "./App";
import { getExtensions } from "./getExtensions";
import { Todo, USER_ID, provider, useSyncedStore } from "./store";

type InputProps = {
  todo: Todo;
  onCreate: (props: { editor: Editor }) => void;
};

export const EditTodo = ({ todo, onCreate }: InputProps) => {
  const user = useSyncedStore((s) => s.storedUsers[USER_ID]?.user) as User;
  const edited = useRef(false);

  const editor = useEditor({
    extensions: getExtensions({ todo, user }),
    onUpdate: () => {
      if (!edited.current) {
        // This is to disregard the initial onUpdate, which is fired on focus
        edited.current = true;
        return;
      }
      todo.modified = Date.now();
      todo.by = USER_ID;
    },
    onCreate: (props) => {
      provider.setAwarenessField("editingId", todo.id);
      onCreate(props);
    },
    onDestroy: () => provider.setAwarenessField("editingId", undefined),
  });

  useEffect(() => {
    // If .focus() is called here it messes up scroll
    editor?.chain().updateUser(user).run();
  }, [user, editor]);

  return <EditorContent editor={editor} />;
};
