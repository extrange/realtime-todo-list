import { Button } from "@mantine/core";
import React, { useCallback, useMemo, useState } from "react";
import { USER_ID } from "./constants";
import { selectTodos, useSyncedStoreCustomImpl } from "./useSyncedStore";

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

export const MarkAllRead = React.memo(
  ({ closeNav }: { closeNav: () => void }) => {
    const todosReadonly = useSyncedStoreCustomImpl(selectTodos, 1000);

    /* Necessary because only localStorage is updated and there is no way to listen to localStorage. */
    const [render, forceRender] = useState({});

    const noUnreadTodos = useMemo(
      () =>
        render &&
        todosReadonly.every((t) => {
          const lastOpened = localStorage.getItem(t.id);

          /* For a todo to have been read, it must
        - have been opened, ever
        - be opened after the latest modified OR
        - was modified by this user */
          return (
            lastOpened &&
            (parseInt(lastOpened) >= t.modified || t.by === USER_ID)
          );
        }),
      [todosReadonly, render]
    );

    const markAllRead = useCallback(() => {
      todosReadonly.forEach((t) =>
        localStorage.setItem(t.id, Date.now().toString())
      );
      document.dispatchEvent(new Event("markAllRead"));
      forceRender({});
      closeNav();
    }, [todosReadonly, closeNav]);

    return noUnreadTodos ? null : (
      <Button disabled={noUnreadTodos} variant="outline" onClick={markAllRead}>
        Mark all as read
      </Button>
    );
  }
);
