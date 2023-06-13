import { Document } from "@tiptap/extension-document";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Heading } from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { User } from "./App";
import { USER_ID } from "./constants";
import { useProvider } from "./useProvider";
import { useStore } from "./useStore";
import { Store, useSyncedStore } from "./useSyncedStore";

type InputProps = {
  editingId: string;
};

const Title = Heading.configure({ levels: [2] });
Title.name = "title";

/**Tiptap Editor with collaborative features */
export const Editor = React.memo(({ editingId }: InputProps) => {
  const store = useStore();

  /* Need the SyncedStore instance here, as editor modifies content */
  const todo = useMemo(
    () => store.todos.find((t) => t.id === editingId),
    [editingId, store.todos]
  );

  if (!todo) {
    throw new Error(`EditTodo: Could not find todo with ID ${editingId}`);
  }

  /* To update lastModified */
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
    onCreate: () => {
      provider.setAwarenessField("editingId", todo.id);
    },
    onDestroy: () => provider.setAwarenessField("editingId", undefined),
  });

  useEffect(() => {
    // If .focus() is called here it messes up scroll
    editor?.chain().updateUser(user).run();
  }, [user, editor]);

  return <EditorContent editor={editor} />;
});
