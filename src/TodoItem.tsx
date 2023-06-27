import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import {
  ActionIcon,
  Avatar,
  Badge,
  Center,
  Flex,
  Menu,
  Overlay,
  Portal,
  ScrollArea,
  Text,
  TextProps,
  Tooltip,
  createPolymorphicComponent,
  useMantineTheme,
} from "@mantine/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import {
  IconCheck,
  IconCheckbox,
  IconClockHour4,
  IconDotsVertical,
  IconRepeat,
  IconSquare,
  IconTargetArrow,
  IconTrash,
} from "@tabler/icons-react";
import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  isValid,
} from "date-fns";
import { generateKeyBetween } from "fractional-indexing";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TimeAgo from "react-timeago";
import sanitizeHtml from "sanitize-html";
import { DueDateString } from "./DueDateString";
import { USER_ID } from "./constants";
import { useStore } from "./useStore";
import { Store, selectLists, useSyncedStore } from "./useSyncedStore";
import { getMaxSortOrder, getTodoTitle } from "./util";

const _StyledText = styled(Text)`
  flex-grow: 1;
  overflow: hidden;
  cursor: default;
  user-select: none;
  overflow-wrap: anywhere;
`;

//https://mantine.dev/styles/styled/#polymorphic-components
const StyledText = createPolymorphicComponent<"div", TextProps>(_StyledText);

const StyledFlex = styled(Flex)`
  @keyframes pop {
    0% {
      transform: scale(1);
      box-shadow: var(--box-shadow);
    }
    100% {
      transform: scale(var(--scale));
      box-shadow: var(--box-shadow-picked-up);
    }
  }
  animation: pop 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22);
  transform: scale(var(--scale));
  border-bottom: 0.0625rem solid rgb(55, 58, 64);

  :hover {
    background-color: rgb(44, 46, 51);
  }
`;

type CommonProps = {
  completed?: boolean;
  todoId: string;
};

type DiscriminatedProps =
  | {
      dragging?: false;
      setEditingId: React.Dispatch<React.SetStateAction<string | undefined>>;
    }
  | {
      dragging: true;
      setEditingId?: never;
    };

const TodoItemInternal = React.memo(
  ({ todoId, setEditingId, completed }: DiscriminatedProps & CommonProps) => {
    const memoizedSelect = useCallback(
      (s: MappedTypeDescription<Store>) => s.todos.find((t) => t.id === todoId),
      [todoId]
    );

    const store = useStore();
    const todoReadOnly = useSyncedStore(memoizedSelect, 100);
    const todo = useMemo(() => memoizedSelect(store), [memoizedSelect, store]);
    const theme = useMantineTheme();
    const [showAvatar, setShowAvatar] = useState(false);
    const lists = useSyncedStore(selectLists);
    const [menuOpened, setMenuOpened] = useState(false);

    if (!todoReadOnly || !todo) {
      throw Error(`Couldn't find Todo with ID ${todoId}`);
    }

    const byUser = useMemo(
      () =>
        todoReadOnly.by ? store.storedUsers[todoReadOnly.by]?.user : undefined,
      [store, todoReadOnly.by]
    );

    const moveToList = useCallback(
      (e: SyntheticEvent, listId?: string) => {
        e.stopPropagation();
        todo.listId = listId;
      },
      [todo]
    );

    /* Listen to markAllRead event and rerender avatar status, checking localStorage */
    useEffect(() => {
      const handleMarkAllRead = () => {
        const lastOpenedStr = localStorage.getItem(todoReadOnly.id);
        const lastOpened = lastOpenedStr ? parseInt(lastOpenedStr) : undefined;

        /* Show avatar if all are true:
        - todo.by exists and is not the current user
        - there is no lastOpened, or lastOpened < todo.modified */
        const shouldShowAvatar =
          todoReadOnly.by &&
          todoReadOnly.by !== USER_ID &&
          (!lastOpened || lastOpened < todoReadOnly.modified);

        setShowAvatar(!!shouldShowAvatar);
      };
      // Run once on initial render
      handleMarkAllRead();

      document.addEventListener("markAllRead", handleMarkAllRead);
      return () =>
        document.removeEventListener("markAllRead", handleMarkAllRead);
    }, [todoReadOnly.by, todoReadOnly.id, todoReadOnly.modified]);

    const deleteTodo = useCallback(
      (e: SyntheticEvent) => {
        e.stopPropagation();
        confirm("Are you sure?") &&
          store.todos.splice(
            store.todos.findIndex((t) => t.id === todoReadOnly.id),
            1
          );
      },
      [todoReadOnly, store]
    );

    const completeTodo = useCallback(
      (e: SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        todo.modified = Date.now();
        todo.by = USER_ID;

        if (todoReadOnly.repeatDays && !todoReadOnly.completed) {
          /* If this is a repeating task that was completed,
          do not mark as completed, update due date */
          todo.dueDate = formatISO(
            addDays(new Date(), todoReadOnly.repeatDays),
            { representation: "date" }
          );
        } else {
          todo.completed = !todoReadOnly.completed;
        }
      },
      [todo, todoReadOnly.completed, todoReadOnly.repeatDays]
    );

    /* Mark todo as read on open */
    const onOpenTodo = useCallback(() => {
      setShowAvatar(false);
      setEditingId?.(todoReadOnly.id);
    }, [setEditingId, todoReadOnly.id]);

    const openMenu = useCallback((e: SyntheticEvent) => {
      e.stopPropagation();
      setMenuOpened(true);
    }, []);

    const toggleFocus = useCallback(() => {
      todo.focus = !todo.focus;

      /* Generate focusSortOrder if moving to focus list */
      if (todo.focus && !todo.focusSortOrder) {
        const maxSortOrder = getMaxSortOrder(
          store.todos.filter((t) => t.focus && !t.completed),
          "focusSortOrder"
        );
        todo.focusSortOrder = generateKeyBetween(maxSortOrder, undefined);
      }
    }, [store.todos, todo]);

    const checkbox = useMemo(
      () => (
        <ActionIcon onClick={completeTodo} mr={10}>
          {todoReadOnly.completed ? (
            <IconCheckbox color={theme.colors.gray[6]} />
          ) : (
            <IconSquare color={theme.colors.gray[6]} />
          )}
        </ActionIcon>
      ),
      [completeTodo, theme.colors.gray, todoReadOnly.completed]
    );

    const dueDateRepeat = useMemo(() => {
      const daysToDue =
        todoReadOnly.dueDate && isValid(Date.parse(todoReadOnly.dueDate))
          ? differenceInCalendarDays(
              Date.parse(todoReadOnly.dueDate),
              new Date()
            )
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
        <>
          {todoReadOnly.dueDate && (
            <Badge
              color={color}
              leftSection={
                <Center>
                  <IconClockHour4 size={14} />
                </Center>
              }
            >
            <DueDateString dueDate={todoReadOnly.dueDate}/>
            </Badge>
          )}
          {todoReadOnly.repeatDays && (
            <Badge
              color="gray"
              leftSection={
                <Center>
                  <IconRepeat size={14} />
                </Center>
              }
            >
              {todoReadOnly.repeatDays} days
            </Badge>
          )}
        </>
      );
    }, [todoReadOnly.dueDate, todoReadOnly.repeatDays]);

    /* The YXmlFragment can be viewed as an array.
    
    The title is the 0th element, and any notes are from index 1 onward.

    The `toJSON` representation of the YXmlFragment however, could contain
    XML tags such as <title> even if empty (such as a todo which is created,
    then subsequently cleared). It is therefore not reliable to check if
    todoReadOnly.content is empty, when determining if the fragment is empty.

    So, to check if it is empty, we check the length of the YXmlFragment.

    To check for the title, we check if there is a first element. The first element will always be the title, even if it is blank.
    */
    const textContent = useMemo(() => {
      /* todoReadOnly.content needs to be here to force rerenders */
      const title = todoReadOnly.content && getTodoTitle(todo);

      /* Take at most 300 chars of the todo's notes */
      const notesArray: string[] = [];
      todo.content.slice(1).every((e) => {
        notesArray.push(sanitizeHtml(e.toString()));
        return notesArray.join(" ").length < 200;
      });

      const notes = notesArray.join(" ");

      return (
        <StyledText lineClamp={2} c={completed ? "dimmed" : undefined}>
          <Text italic={!title} c={!title ? "dimmed" : undefined}>
            {title || "(untitled)"}
          </Text>
          <Text fz={theme.fontSizes.sm} italic c={"dimmed"}>
            {notes}
          </Text>
        </StyledText>
      );
    }, [todoReadOnly.content, todo, completed, theme.fontSizes.sm]);

    const avatar = useMemo(
      () =>
        showAvatar && (
          <Avatar
            size={"sm"}
            styles={{
              placeholder: {
                background: theme.fn.darken(byUser?.color || "#000000", 0.3),
                color: theme.fn.lighten(byUser?.color || "#FFFFFF", 0.5),
              },
            }}
          >
            {byUser?.name?.charAt(0).toUpperCase() || "?"}
          </Avatar>
        ),
      [byUser?.color, byUser?.name, showAvatar, theme.fn]
    );

    const menu = useMemo(
      () => (
        <Menu opened={menuOpened} onChange={setMenuOpened} withinPortal>
          <Portal>{menuOpened && <Overlay opacity={0} />}</Portal>
          <Menu.Target>
            <ActionIcon onClick={openMenu}>
              <IconDotsVertical color={theme.colors.gray[6]} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item
              icon={<IconTargetArrow size={16} />}
              onClick={toggleFocus}
            >
              {todoReadOnly.focus ? "Remove from Focus" : "Add to Focus"}
            </Menu.Item>
            <Menu.Item icon={<IconTrash size={16} />} onClick={deleteTodo}>
              Delete
            </Menu.Item>
            <Menu.Divider />
            <ScrollArea h={250} type="auto">
              <Menu.Item
                onClick={(e) => moveToList(e, undefined)}
                icon={!todo.listId && <IconCheck size={16} />}
                fs={"italic"}
              >
                Uncategorized
              </Menu.Item>
              {lists.map((l) => (
                <Menu.Item
                  key={l.id}
                  onClick={(e) => moveToList(e, l.id)}
                  icon={todo.listId === l.id && <IconCheck size={16} />}
                  maw={300}
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {l.name}
                </Menu.Item>
              ))}
            </ScrollArea>
          </Menu.Dropdown>
        </Menu>
      ),
      [
        deleteTodo,
        lists,
        menuOpened,
        moveToList,
        openMenu,
        theme.colors.gray,
        todo.listId,
        todoReadOnly.focus,
        toggleFocus,
      ]
    );

    return (
      <Flex direction={"column"} w="100%" py={10} px={5} onClick={onOpenTodo}>
        <Flex align={"center"}>
          {checkbox}
          {todoReadOnly.focus && (
            <Tooltip position="bottom" label="In Focus">
              <IconTargetArrow style={{ marginRight: 10, flexShrink: 0 }} />
            </Tooltip>
          )}
          <Tooltip
            openDelay={500}
            multiline
            position={"bottom"}
            label={
              <div>
                <Text>
                  Modified <TimeAgo live={false} date={todoReadOnly.modified} />{" "}
                  by{" "}
                  {todoReadOnly.by && todoReadOnly.by === USER_ID
                    ? "you"
                    : byUser && byUser.name}
                </Text>
                <Text>
                  Created <TimeAgo live={false} date={todoReadOnly.created} />
                </Text>
                <Text>sortOrder: {todoReadOnly.sortOrder ?? "N/A"}</Text>
              </div>
            }
          >
            {textContent}
          </Tooltip>
          {avatar}
          {menu}
        </Flex>
        <Flex mt={5} sx={{ userSelect: "none" }}>
          {dueDateRepeat}
        </Flex>
      </Flex>
    );
  }
);

/**
 * This component is separated into 2 because of this issue.
 * https://github.com/clauderic/dnd-kit/issues/389#issuecomment-1013324147
 *
 * Essentially, when dragging, all the Sortables re-render unnecessarily.
 *
 * Heavy memoization helps somewhat, as the contents of the Todo don't rerender
 * (even if the container of the Todo does).
 */
export const TodoItem = React.memo(
  (props: DiscriminatedProps & CommonProps) => {
    const { dragging, todoId } = props;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: todoId,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,

      // isDragging: the 'shadow' of the active item (follows overlay)
      ...(isDragging && { opacity: 0.5, cursor: "grab" }),

      // dragging: the overlay of the dragged thing
      ...(dragging && {
        "--scale": 1.05,
        backgroundColor: "rgb(44, 46, 51)",
      }),
    } as React.CSSProperties;

    return (
      <StyledFlex
        {...listeners}
        align={"center"}
        ref={setNodeRef}
        {...attributes}
        style={style}
      >
        <TodoItemInternal {...props} />
      </StyledFlex>
    );
  }
);
