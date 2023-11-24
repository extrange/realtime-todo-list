import { Button, Text } from "@mantine/core";
import React, { useCallback, useMemo, useState } from "react";
import { USER_ID } from "./constants";
import { selectTodos, useSyncedStoreCustomImpl } from "./useSyncedStore";

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
      forceRender({});
      closeNav();
    }, [todosReadonly, closeNav]);

    return (
      <Button
        disabled={noUnreadTodos}
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
