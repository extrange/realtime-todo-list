import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { debounce } from "lodash";
import { useEffect } from "react";
import { User } from "./App";
import { getExtensions } from "./getExtensions";
import { Todo, USER_ID, provider, useSyncedStore } from "./store";

type InputProps = {
  todo: Todo;
  onCreate: (props: { editor: Editor }) => void;
};

export const EditTodo = ({ todo, onCreate }: InputProps) => {
  const user = useSyncedStore((s) => s.storedUsers[USER_ID]?.user) as User;

  const editor = useEditor({
    extensions: getExtensions({ todo, user }),
    editorProps: {
      handleTextInput: debounce(() => {
        todo.modified = Date.now();
        todo.by = USER_ID;
        return false;
      }, 500),
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
