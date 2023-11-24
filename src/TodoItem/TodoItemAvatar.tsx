import { Avatar, darken, lighten } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React from "react";
import { Todo } from "../types/Todo";
import { useStore } from "../useStore";

type InputProps = {
  todo: Todo;
};

export const TodoItemAvatar = React.memo(({ todo: _todo }: InputProps) => {
  const store = useStore();
  const storedUsers = useSyncedStore(store.storedUsers);
  const todo = useSyncedStore(_todo);

  const byUser = todo.by ? storedUsers[todo.by]?.user : undefined;

  return (
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
  );
});
