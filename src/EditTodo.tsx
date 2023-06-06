import { Editor } from "@tiptap/core";
import { Document } from "@tiptap/extension-document";
import { Heading } from "@tiptap/extension-heading";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { User } from "./App";
import { Store, Todo, useSyncedStore } from "./useSyncedStore";

import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { USER_ID } from "./constants";
import { useProvider } from "./useProvider";

type InputProps = {
  todo: Todo;
  onCreate: (props: { editor: Editor }) => void;
};

const Title = Heading.configure({ levels: [2] });
Title.name = "title";

export const EditTodo = ({ todo, onCreate }: InputProps) => {
  const selectOwnUser = useCallback(
    (s: MappedTypeDescription<Store>) => s.storedUsers[USER_ID]?.user,
    []
  );
  const user = useSyncedStore(selectOwnUser) as User;
  const provider = useProvider();
  const edited = useRef(false);

  const editor = useEditor({
    extensions: [
      TaskItem.configure({ nested: true }),
      TaskList,
      StarterKit.configure({
        history: false,
        document: false,
      }),
      Title,
      Document.extend({ content: "title block*" }),
      ...(todo ? [Collaboration.configure({ fragment: todo.content })] : []),
      ...(user
        ? // Uses user.name and user.color for rendering
          [CollaborationCursor.configure({ provider: provider, user })]
        : []),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "title") {
            return "Title";
          }

          return "Notes";
        },
        showOnlyCurrent: false,
        includeChildren: false,
      }),
    ],

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
