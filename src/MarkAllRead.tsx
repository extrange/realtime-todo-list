import { Button } from "@mantine/core";
import { useSyncedStore } from "./store";

type MarkAllRead = "markAllRead";

declare global {
  interface Document {
    addEventListener<K extends MarkAllRead>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
    removeEventListener<K extends MarkAllRead>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
  }
}

export const MarkAllRead = () => {
  const todos = useSyncedStore((s) => s.todos, 1000);

  const noUnreadTodos = todos.every((t) => {
    const lastOpened = localStorage.getItem(t.id);
    return lastOpened && parseInt(lastOpened) >= t.modified;
  });

  const markAllRead = () => {
    todos.forEach((t) => localStorage.setItem(t.id, Date.now().toString()));
    document.dispatchEvent(new Event("markAllRead"));
  };

  return (
    <Button disabled={noUnreadTodos} variant="outline" onClick={markAllRead}>
      Mark all as read
    </Button>
  );
};
