import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import {
  ActionIcon,
  Avatar,
  Flex,
  Menu,
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
  IconDotsVertical,
  IconSquare,
  IconTrash,
} from "@tabler/icons-react";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TimeAgo from "react-timeago";
import { USER_ID } from "./constants";
import { useStore } from "./useStore";
import { Store, selectLists, useSyncedStore } from "./useSyncedStore";

const _StyledText = styled(Text)`
  flex-grow: 1;
  overflow: hidden;
  cursor: default;
  user-select: none;
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

type InputProps =
  | {
      dragging?: false;
      todoId: string;
      setEditingId: React.Dispatch<React.SetStateAction<string | undefined>>;
    }
  | {
      dragging: true;
      todoId: string;
      setEditingId?: never;
    };

const TaskInternal = React.memo(({ todoId, setEditingId }: InputProps) => {
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
    return () => document.removeEventListener("markAllRead", handleMarkAllRead);
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
      todo.completed = !todoReadOnly.completed;
    },
    [todo, todoReadOnly.completed]
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

  const textContent = useMemo(
    () =>
      todoReadOnly.content ? (
        <StyledText lineClamp={2}>
          {/* https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/ */}
          {(todoReadOnly.content as unknown as string).replace(
            /(<([^>]+)>)/gi,
            ""
          )}
        </StyledText>
      ) : (
        <StyledText italic c={"dimmed"}>
          (empty)
        </StyledText>
      ),
    [todoReadOnly.content]
  );

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
      <Menu opened={menuOpened} onChange={setMenuOpened}>
        <Menu.Target>
          <ActionIcon onClick={openMenu}>
            <IconDotsVertical color={theme.colors.gray[6]} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item icon={<IconTrash size={16} />} onClick={deleteTodo}>
            Delete
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={(e) => moveToList(e, undefined)}
            icon={!todo.listId && <IconCheck size={16} />}
          >
            Uncategorized
          </Menu.Item>
          {lists.map((l) => (
            <Menu.Item
              onClick={(e) => moveToList(e, l.id)}
              icon={todo.listId === l.id && <IconCheck size={16} />}
            >
              {l.name}
            </Menu.Item>
          ))}
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
    ]
  );

  return (
    <Flex onClick={onOpenTodo} py={10} px={5} w={"100%"} align={"center"}>
      {checkbox}
      <Tooltip
        openDelay={500}
        multiline
        position={"bottom"}
        label={
          <div>
            <Text>
              Modified <TimeAgo live={false} date={todoReadOnly.modified} /> by{" "}
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
  );
});

/**
 * This component is separated into 2 because of this issue.
 * https://github.com/clauderic/dnd-kit/issues/389#issuecomment-1013324147
 *
 * Essentially, when dragging, all the Sortables re-render unnecessarily.
 *
 * Heavy memoization helps somewhat, as the contents of the Todo don't rerender
 * (even if the container of the Todo does).
 */
export const Task = React.memo((props: InputProps) => {
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
      <TaskInternal {...props} />
    </StyledFlex>
  );
});
