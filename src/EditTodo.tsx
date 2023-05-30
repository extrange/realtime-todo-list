import { useLocalStorage } from "@mantine/hooks";
import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { debounce } from "lodash";
import { useEffect } from "react";
import { getExtensions } from "./getExtensions";
import { Todo } from "./store";
import { generateUser } from "./util";

type InputProps = {
  todo: Todo;
  onCreate: (props: { editor: Editor }) => void;
};

export const EditTodo = ({ todo, onCreate }: InputProps) => {
  const [user] = useLocalStorage({
    key: "user",
    defaultValue: generateUser(),
  });

  const editor = useEditor({
    extensions: getExtensions({ todo, user }),
    editorProps: {
      handleTextInput: debounce(() => {
        todo.modified = Date.now();
        todo.by = user;
        return false;
      }, 500),
    },
    onCreate,
  });

  useEffect(() => {
    // If .focus() is called here it messes up scroll
    editor?.chain().updateUser(user).run();
  }, [user, editor]);

  return <EditorContent editor={editor} />;
};
