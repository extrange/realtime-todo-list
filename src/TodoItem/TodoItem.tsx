import {
  ActionIcon,
  Anchor,
  Badge,
  Center,
  Flex,
  Menu,
  Overlay,
  Portal,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getYjsValue } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";
import {
  IconCheck,
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
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { YMap, YMapEvent } from "yjs/dist/src/internals";
import { DueDateString } from "../DueDateString";
import { useAppStore } from "../appStore/appStore";
import { USER_ID } from "../constants";
import { Todo } from "../types/Todo";
import { getTodoTitle } from "../util";
import classes from "./TodoItem.module.css";
import { TodoItemAvatar } from "./TodoItemAvatar";
import { TodoItemMenuDropdown } from "./TodoItemMenuDropdown";
import { TodoItemSubtaskCount } from "./TodoItemSubtaskCount";
import { TodoItemTextContent } from "./TodoItemTextContent";
import { TodoItemProps } from "./TodoItemWrapper";

export const TodoItem = React.memo(({ todo: _todo }: TodoItemProps) => {
  const theme = useMantineTheme();
  const setEditingTodo = useAppStore((state) => state.setEditingTodo);

  // Necessary to make this reactive
  // Causes extra rerender only in strict mode (hook 1 changed)
  const todo = useSyncedStore(_todo);

  const [lastOpened, setLastOpened] = useState<number | undefined>(() => {
    // Fetch lastOpened on first render
    const lastOpenedStr = localStorage.getItem(todo.id);
    return lastOpenedStr ? parseInt(lastOpenedStr) : undefined;
  });

  /* Show avatar if all are true:
    - todo.by exists and is not the current user
    - there is no lastOpened, or lastOpened < todo.modified */
  const modified = todo.modified; // to force a listener
  const shouldShowAvatar =
    todo.by && todo.by !== USER_ID && (!lastOpened || lastOpened < modified);

  // Listen to read events and stop displaying avatar accordingly
  useEffect(() => {
    const handler = () => setLastOpened(Date.now());

    document.addEventListener(todo.id, handler);
    return () => document.removeEventListener(todo.id, handler);
  }, [todo.id]);

  /* Update modified/by whenever properties of the Todo are changed
  Performance notes:
  - doesn't seem to fire on initial load (fortunately)
  - keysChanged seems to always be a singleton set*/
  const yTodo = getYjsValue(todo) as YMap<Todo>;
  useEffect(() => {
    const listener = (ymapEventArray: YMapEvent<YMap<keyof Todo>>[]) => {
      ymapEventArray.forEach((e) => {
        // Ignore remote events
        if (!e.transaction.local) return;

        // Ignore updates to modified/by to prevent loops
        const keysChanged: Set<keyof Todo> = e.keysChanged;
        if (
          keysChanged && // undefined when typing in Editor
          (keysChanged.has("modified") || keysChanged.has("by"))
        )
          return;

        todo.modified = Date.now();
        todo.by = USER_ID;
      });
    };
    //@ts-expect-error YMapEvent somehow isn't allowed even though it subclasses YEvent
    yTodo.observeDeep(listener);
    //@ts-expect-error ignore
    return () => yTodo.unobserveDeep(listener);
  }, [todo, yTodo]);

  const [menuOpened, setMenuOpened] = useState(false);

  const openMenu = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
    setMenuOpened(true);
  }, []);

  /**
   * Completing a Focus todo will also unmark it from Focus.
   *
   * Note: this can be clicked on either a completed or uncompleted todo,
   * so we have to handle both cases.
   * */
  const completeTodo = useCallback(
    (e: SyntheticEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const originalCompleted = todo.completed;

      todo.modified = Date.now();
      todo.by = USER_ID;

      // Array of actions to take, when 'undo' is clicked on the notification
      const undoActions: Array<() => unknown> = [];

      // Uncompleting a todo
      if (todo.completed) {
        undoActions.push(() => (todo.completed = true));
        todo.completed = false;
      } else {
        // Completing a todo
        if (todo.focus) {
          // Focus todo: also remove Focus
          todo.focus = false;
          undoActions.push(() => (todo.focus = true));
        }

        /* Repeating todo:
        - do not mark as completed, just update due date */
        if (todo.repeatDays && !todo.completed) {
          const originalDueDate = todo.dueDate;
          todo.dueDate = formatISO(addDays(new Date(), todo.repeatDays), {
            representation: "date",
          });

          // To undo, we reset the due date
          undoActions.push(() => (todo.dueDate = originalDueDate));
        } else {
          // Non-repeating todo
          todo.completed = true;

          undoActions.push(() => (todo.completed = false));
        }
      }

      // Fixes notifications not appearing when manually completing then uncompleting a todo
      notifications.hide(todo.id);

      notifications.show({
        id: todo.id,
        autoClose: 3000,
        withCloseButton: false,
        ...(!originalCompleted && { icon: <IconCheck size={"1.1rem"} /> }),
        message: (
          <Flex className={classes.notification} align={"center"}>
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {!originalCompleted
                ? getTodoTitle(todo)
                : "Marked as uncompleted"}
            </div>
            <Anchor
              onClick={() => {
                undoActions.forEach((f) => f());
                notifications.update({
                  id: todo.id,
                  message: "Action undone",
                  autoClose: 1000,
                  withCloseButton: false,
                });
              }}
            >
              Undo
            </Anchor>
          </Flex>
        ),
      });
    },
    [todo]
  );

  /* Mark todo as read on open.
  Note: custom events required - localStorage events don't fire in the same tab
  https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event */
  const onOpenTodo = useCallback(() => {
    localStorage.setItem(todo.id, Date.now().toString());
    document.dispatchEvent(new Event(todo.id));
    setEditingTodo(todo);
  }, [setEditingTodo, todo]);

  const checkbox = useMemo(
    () => (
      <ActionIcon variant="subtle" onClick={completeTodo} mr={10}>
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
          ? theme.colors.red[7]
          : daysToDue < 4
          ? theme.colors.orange[8]
          : "gray"
        : undefined;

    return (
      <>
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
      </>
    );
  }, [theme, todo.dueDate, todo.repeatDays]);

  const todoFocus = useMemo(
    () =>
      todo.focus && (
        <IconTargetArrow style={{ marginRight: 10, flexShrink: 0 }} />
      ),
    [todo.focus]
  );

  return (
    <Flex
      direction={"column"}
      onClick={onOpenTodo}
      className={classes.todoContainer}
    >
      <Flex align={"center"}>
        {checkbox}
        {todoFocus}
        <TodoItemTextContent todo={todo} />
        {shouldShowAvatar && <TodoItemAvatar todo={todo} />}
        <Menu opened={menuOpened} onChange={setMenuOpened} withinPortal>
          <Portal>{menuOpened && <Overlay opacity={0} />}</Portal>
          <Menu.Target>
            <ActionIcon variant="subtle" onClick={openMenu}>
              <IconDotsVertical color={theme.colors.gray[6]} />
            </ActionIcon>
          </Menu.Target>
          {menuOpened && <TodoItemMenuDropdown todo={todo} />}
        </Menu>
      </Flex>

      <Flex mt={5} className={classes.dueDateRepeat}>
        {dueDateRepeat}
        <TodoItemSubtaskCount todo={todo} />
      </Flex>
    </Flex>
  );
});

TodoItem.displayName = "TodoItem";
