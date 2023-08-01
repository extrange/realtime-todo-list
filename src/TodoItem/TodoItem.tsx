import styled from "@emotion/styled";
import {
  ActionIcon,
  Badge,
  Center,
  Flex,
  Menu,
  Overlay,
  Portal,
  useMantineTheme,
} from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import {
  IconCheckbox,
  IconClockHour4,
  IconDotsVertical,
  IconRepeat,
  IconSquare,
  IconTargetArrow,
} from "@tabler/icons-react";
import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  isValid,
} from "date-fns";
import React, { SyntheticEvent, useCallback, useMemo, useState } from "react";
import { DueDateString } from "../DueDateString";
import { useAppStore } from "../appStore";
import { USER_ID } from "../constants";
import { TodoItemAvatar } from "./TodoItemAvatar";
import { TodoItemMenuDropdown } from "./TodoItemMenuDropdown";
import { TodoItemTextContent } from "./TodoItemTextContent";
import { TodoItemProps } from "./TodoItemWrapper";

const StyledFlex = styled(Flex)`
  border-bottom: 0.0625rem solid rgb(55, 58, 64);

  :hover {
    background-color: rgb(44, 46, 51);
  }
`;

export const TodoItem = React.memo(({ todo: _todo }: TodoItemProps) => {
  const theme = useMantineTheme();
  const setEditingTodo = useAppStore((state) => state.setEditingTodo);

  // Necessary to make this reactive
  // Causes extra rerender only in strict mode (hook 1 changed)
  const todo = useSyncedStore(_todo);

  const [menuOpened, setMenuOpened] = useState(false);

  const openMenu = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
    setMenuOpened(true);
  }, []);

  const completeTodo = useCallback(
    (e: SyntheticEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      todo.modified = Date.now();
      todo.by = USER_ID;

      if (todo.repeatDays && !todo.completed) {
        /* If this is a repeating task that was completed,
          do not mark as completed, update due date */
        todo.dueDate = formatISO(addDays(new Date(), todo.repeatDays), {
          representation: "date",
        });
      } else {
        todo.completed = !todo.completed;
      }
    },
    [todo]
  );

  /* Mark todo as read on open */
  const onOpenTodo = useCallback(() => {
    localStorage.setItem(todo.id, Date.now().toString());
    setEditingTodo(todo);
  }, [setEditingTodo, todo]);

  const checkbox = useMemo(
    () => (
      <ActionIcon onClick={completeTodo} mr={10}>
        {todo.completed ? (
          <IconCheckbox color={theme.colors.gray[6]} />
        ) : (
          <IconSquare color={theme.colors.gray[6]} />
        )}
      </ActionIcon>
    ),
    [completeTodo, theme.colors.gray, todo.completed]
  );

  const dueDateRepeat = useMemo(() => {
    const daysToDue =
      todo.dueDate && isValid(Date.parse(todo.dueDate))
        ? differenceInCalendarDays(Date.parse(todo.dueDate), new Date())
        : undefined;

    const color =
      typeof daysToDue === "number"
        ? daysToDue < 1
          ? "red"
          : daysToDue < 4
          ? "yellow"
          : "gray"
        : undefined;

    return (
      <Flex mt={5} sx={{ userSelect: "none" }}>
        {todo.dueDate && (
          <Badge
            color={color}
            leftSection={
              <Center>
                <IconClockHour4 size={14} />
              </Center>
            }
          >
            <DueDateString dueDate={todo.dueDate} />
          </Badge>
        )}
        {todo.repeatDays && (
          <Badge
            color="gray"
            leftSection={
              <Center>
                <IconRepeat size={14} />
              </Center>
            }
          >
            {todo.repeatDays} days
          </Badge>
        )}
      </Flex>
    );
  }, [todo.dueDate, todo.repeatDays]);

  const todoFocus = useMemo(
    () =>
      todo.focus && (
        <IconTargetArrow style={{ marginRight: 10, flexShrink: 0 }} />
      ),
    [todo.focus]
  );

  return (
    <StyledFlex
      direction={"column"}
      w="100%"
      py={10}
      px={5}
      onClick={onOpenTodo}
    >
      <Flex align={"center"}>
        {checkbox}
        {todoFocus}
        <TodoItemTextContent todo={todo} />
        <TodoItemAvatar todo={todo} />
        <Menu opened={menuOpened} onChange={setMenuOpened} withinPortal>
          <Portal>{menuOpened && <Overlay opacity={0} />}</Portal>
          <Menu.Target>
            <ActionIcon onClick={openMenu}>
              <IconDotsVertical color={theme.colors.gray[6]} />
            </ActionIcon>
          </Menu.Target>
          {menuOpened && <TodoItemMenuDropdown todo={todo} />}
        </Menu>
      </Flex>
      {dueDateRepeat}
    </StyledFlex>
  );
});

TodoItem.displayName = "TodoItem";