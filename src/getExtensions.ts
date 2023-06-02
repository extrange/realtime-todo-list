import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Document } from "@tiptap/extension-document";
import { Heading } from "@tiptap/extension-heading";
import { Placeholder } from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { User } from "./App";
import { Todo, provider } from "./store";

const Title = Heading.configure({ levels: [2] });
Title.name = "title";

/**
 * Get extensions for use in the Tiptap editor.
 */
export const getExtensions = ({ todo, user }: { todo?: Todo; user?: User }) => [
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
    // Uses user.name and user.color for rendering
    ? [CollaborationCursor.configure({ provider: provider, user })]
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
];
