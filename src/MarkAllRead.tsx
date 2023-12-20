import { Button, Text } from "@mantine/core";
import { Y, getYjsValue } from "@syncedstore/core";
import { debounce } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import { USER_ID } from "./constants";
import { Todo } from "./types/Todo";
import { useStore } from "./useStore";

type CustomEventMap = {
  todoItemOpened: CustomEvent;
  markAllRead: CustomEvent;
};
declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
  }
}

// Needs to listen to opening todos, as well as changes to Todo.modified
export const MarkAllRead = React.memo(
  ({ closeNav }: { closeNav: () => void }) => {
    const store = useStore();

    const [unreadTodos, setUnreadTodos] = useState<boolean>(false);

    useEffect(() => {
      const handler = () => {
        setUnreadTodos(
          /* Perf: takes 4-6ms for few thousand todos */
          !store.todos.every((t) => {
            // Ignore completed todos
            if (t.completed) return true;

            const lastOpened = localStorage.getItem(t.id);

            /* For a todo to have been read, it must
            - have been opened, ever
            - be opened after the latest modified OR
            - was modified by this user */
            return (
              lastOpened &&
              (parseInt(lastOpened) > t.modified || t.by === USER_ID)
            );
          })
        );
      };

      // Run whenever a todo is opened
      document.addEventListener("todoItemOpened", handler);

      // Run whenever todos are modified - debounced
      const debouncedHandler = debounce(handler, 1000, { maxWait: 1000 });
      (getYjsValue(store.todos) as Y.Array<Y.Map<keyof Todo>>).observeDeep(
        debouncedHandler
      );

      // Run on first render
      handler();
      return () => {
        document.removeEventListener("todoItemOpened", handler);
        (getYjsValue(store.todos) as Y.Array<Y.Map<keyof Todo>>).unobserveDeep(
          debouncedHandler
        );
      };
    }, [store.todos]);

    // FIXME: poor performance with 1000s of todos
    const markAllRead = useCallback(() => {
      const now = Date.now().toString();
      store.todos.forEach((t) => localStorage.setItem(t.id, now));

      // Update button status
      setUnreadTodos(false)

      // Trigger todo avatar updates
      document.dispatchEvent(new Event("markAllRead"));

      closeNav();
    }, [store.todos, closeNav]);

    return (
      <Button
        disabled={!unreadTodos}
        variant="outline"
        onClick={markAllRead}
        fullWidth
        styles={{
          root: { minWidth: 0 },
        }}
      >
        <Text truncate>Mark all read</Text>
      </Button>
    );
  }
);
