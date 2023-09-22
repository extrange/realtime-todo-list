import { Menu, ScrollArea } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import { IconCheck, IconTargetArrow, IconTrash } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import React, { SyntheticEvent, useCallback } from "react";
import { useStore } from "../useStore";
import { Todo } from "../types/Todo";
import { getMaxSortOrder } from "../util";

type InputProps = {
  todo: Todo;
};

export const TodoItemMenuDropdown = React.memo(({ todo }: InputProps) => {
  const store = useStore();
  const state = useSyncedStore(store);

  const moveToList = useCallback(
    (listId?: string) => (e: SyntheticEvent) => {
      e.stopPropagation();
      todo.listId = listId;
    },
    [todo]
  );

  const deleteTodo = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      confirm("Are you sure?") &&
        state.todos.splice(
          state.todos.findIndex((t) => t.id === todo.id),
          1
        );
    },
    [todo, state]
  );

  const toggleFocus = useCallback(() => {
    todo.focus = !todo.focus;

    /* Generate focusSortOrder if moving to focus list */
    if (todo.focus && !todo.focusSortOrder) {
      const maxSortOrder = getMaxSortOrder(
        state.todos.filter((t) => t.focus && !t.completed),
        "focusSortOrder"
      );
      todo.focusSortOrder = generateKeyBetween(maxSortOrder, undefined);
    }
  }, [state.todos, todo]);

  const stopPropagation = useCallback(
    (e: SyntheticEvent) => e.stopPropagation(),
    []
  );

  return (
    <Menu.Dropdown onClick={stopPropagation}>
      <Menu.Item icon={<IconTargetArrow size={16} />} onClick={toggleFocus}>
        {todo.focus ? "Remove from Focus" : "Add to Focus"}
      </Menu.Item>
      <Menu.Item icon={<IconTrash size={16} />} onClick={deleteTodo}>
        Delete
      </Menu.Item>
      <Menu.Divider />
      <ScrollArea h={250} type="auto">
        <Menu.Item
          onClick={moveToList(undefined)}
          icon={!todo.listId && <IconCheck size={16} />}
          fs={"italic"}
        >
          Uncategorized
        </Menu.Item>
        {state.lists.map((l) => (
          <Menu.Item
            key={l.id}
            onClick={moveToList(l.id)}
            icon={todo.listId === l.id && <IconCheck size={16} />}
            maw={300}
            sx={{ overflowWrap: "anywhere" }}
          >
            {l.name}
          </Menu.Item>
        ))}
      </ScrollArea>
    </Menu.Dropdown>
  );
});

TodoItemMenuDropdown.displayName = "TodoItemMenuDropdown";
