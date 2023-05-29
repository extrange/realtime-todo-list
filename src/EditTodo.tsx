import { useLocalStorage } from "@mantine/hooks";
import { EditorContent, useEditor } from "@tiptap/react";
import { debounce } from "lodash";
import { useEffect } from "react";
import { getExtensions } from "./getExtensions";
import { Todo } from "./store";
import { generateUser } from "./util";

type InputProps = {
  todo: Todo;
};

export const EditTodo = ({ todo }: InputProps) => {
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
  });

  useEffect(() => {
    editor?.chain().updateUser(user).focus().run();
  }, [user, editor]);

  return <EditorContent editor={editor} />;
};
