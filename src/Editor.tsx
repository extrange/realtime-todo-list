import { RichTextEditor } from "@mantine/tiptap";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Document } from "@tiptap/extension-document";
import { Heading } from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { User } from "./AppShell";
import { USER_ID } from "./constants";
import { ClearFormattingControl } from "./controls/ClearFormattingControl";
import { IndentControl } from "./controls/IndentControl";
import { TableControl } from "./controls/TableControl";
import { ToggleCodeBlockControl } from "./controls/ToggleCodeBlockControl";
import { ToggleTaskControl } from "./controls/ToggleTaskControl";
import { UndoControl } from "./controls/UndoControl";
import { useProvider } from "./useProvider";
import { useStore } from "./useStore";
import { Store, useSyncedStoreCustomImpl } from "./useSyncedStore";
import { getTodoTitle } from "./util";

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
  const user = useSyncedStoreCustomImpl(selectOwnUser) as User;
  const provider = useProvider();
  const edited = useRef(false);

  const editor = useEditor({
    extensions: [
      TaskItem.configure({ nested: true }),
      TaskList,
      Underline,
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight,
      StarterKit.configure({
        history: false,
        document: false,
      }),
      Title,
      Document.extend({ content: "title block+" }),
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

    /* Autofocus only if title is not set */
    autofocus: !getTodoTitle(todo),

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

  /* Update user live cursor on changes while editing */
  useEffect(() => {
    // If .focus() is called here it messes up scroll
    editor?.chain().updateUser(user).run();
  }, [user, editor]);

  const toolbar = useMemo(
    () => (
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <UndoControl />
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <ClearFormattingControl />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
          <ToggleCodeBlockControl />
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <ToggleTaskControl />
          <IndentControl.Decrease />
          <IndentControl.Increase />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <TableControl.InsertTable />
          <TableControl.DeleteTable />
          <TableControl.InsertRowBefore />
          <TableControl.InsertRowAfter />
          <TableControl.DeleteRow />
          <TableControl.InsertColumnLeft />
          <TableControl.InsertColumnRight />
          <TableControl.DeleteColumn />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
    ),
    []
  );

  return (
    <RichTextEditor editor={editor} withTypographyStyles={false}>
      {toolbar}
      <RichTextEditor.Content />
    </RichTextEditor>
  );
});

Editor.displayName = "Editor";
