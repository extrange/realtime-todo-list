import { Button } from "@mantine/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import React, { useCallback, useMemo } from "react";
import { Store, USER_ID, useSyncedStore } from "./store";

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

export const MarkAllRead = React.memo(() => {
  const memoizedSelect = useCallback(
    (s: MappedTypeDescription<Store>) => s.todos,
    []
  );
  const [todosReadonly] = useSyncedStore(memoizedSelect, 1000);

  const noUnreadTodos = useMemo(
    () =>
      todosReadonly.every((t) => {
        const lastOpened = localStorage.getItem(t.id);

        /* For a todo to have been read, it must
    - have been opened, ever
    - be opened after the latest modified OR
    - was modified by this user */
        return (
          lastOpened && (parseInt(lastOpened) >= t.modified || t.by === USER_ID)
        );
      }),
    [todosReadonly]
  );

  const markAllRead = useCallback(() => {
    todosReadonly.forEach((t) =>
      localStorage.setItem(t.id, Date.now().toString())
    );
    document.dispatchEvent(new Event("markAllRead"));
  }, [todosReadonly]);

  return (
    <Button disabled={noUnreadTodos} variant="outline" onClick={markAllRead}>
      Mark all as read
    </Button>
  );
});
