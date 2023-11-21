import { Avatar } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { useEffect, useState } from "react";
import { USER_ID } from "../constants";
import { useStore } from "../useStore";
import { Todo } from "../types/Todo";
import {darken, lighten} from "@mantine/core"

type InputProps = {
  todo: Todo;
};

export const TodoItemAvatar = React.memo(({ todo }: InputProps) => {
  const store = useStore();
  const storedUsers = useSyncedStore(store.storedUsers);

  const [showAvatar, setShowAvatar] = useState(false);
  const byUser = todo.by ? storedUsers[todo.by]?.user : undefined;

  /* Listen to markAllRead event and rerender avatar status, checking localStorage */
  useEffect(() => {
    const handleMarkAllRead = () => {
      const lastOpenedStr = localStorage.getItem(todo.id);
      const lastOpened = lastOpenedStr ? parseInt(lastOpenedStr) : undefined;

      /* Show avatar if all are true:
        - todo.by exists and is not the current user
        - there is no lastOpened, or lastOpened < todo.modified */
      const shouldShowAvatar =
        todo.by &&
        todo.by !== USER_ID &&
        (!lastOpened || lastOpened < todo.modified);

      setShowAvatar(!!shouldShowAvatar);
    };
    // Run once on initial render
    handleMarkAllRead();

    document.addEventListener("markAllRead", handleMarkAllRead);
    return () => document.removeEventListener("markAllRead", handleMarkAllRead);
  }, [setShowAvatar, todo.by, todo.id, todo.modified]);

  return showAvatar ? (
    <Avatar
      size={"sm"}
      styles={{
        placeholder: {
          background: darken(byUser?.color || "#000000", 0.3),
          color: lighten(byUser?.color || "#FFFFFF", 0.5),
        },
      }}
    >
      {byUser?.name?.charAt(0).toUpperCase() || "?"}
    </Avatar>
  ) : null;
});
