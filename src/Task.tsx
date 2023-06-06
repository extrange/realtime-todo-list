import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import {
  ActionIcon,
  Avatar,
  Flex,
  Menu,
  Text,
  Tooltip,
  useMantineTheme
} from "@mantine/core";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import {
  IconCheck,
  IconCheckbox,
  IconDotsVertical,
  IconSquare,
  IconTrash,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TimeAgo from "react-timeago";
import { USER_ID } from "./constants";
import { useStore } from "./useStore";
import { Store, selectLists, useSyncedStore } from "./useSyncedStore";

const StyledTextDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 10px;
`;

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
  padding: 0;
  padding: 10px 0;
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

  if (!todoReadOnly || !todo) {
    throw Error(`Couldn't find Todo with ID ${todoId}`);
  }

  const byUser = todoReadOnly.by
    ? store.storedUsers[todoReadOnly.by]?.user
    : undefined;

  const moveToList = useCallback(
    (listId?: string) => {
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
    () =>
      confirm("Are you sure?") &&
      store.todos.splice(
        store.todos.findIndex((t) => t.id === todoReadOnly.id),
        1
      ),
    [todoReadOnly, store]
  );

  const completeTodo = () => {
    todo.modified = Date.now();
    todo.by = USER_ID;
    todo.completed = !todoReadOnly.completed;
  };

  /* Mark todo as read on open */
  const onOpenTodo = () => {
    setShowAvatar(false);
    setEditingId?.(todoReadOnly.id);
  };

  const textContent = useMemo(
    () =>
      todoReadOnly.content ? (
        <Text
          lineClamp={2}
          style={{
            overflowWrap: "anywhere",
            cursor: "default",
            userSelect: "none",
          }}
        >
          {/* https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/ */}
          {(todoReadOnly.content as unknown as string).replace(
            /(<([^>]+)>)/gi,
            ""
          )}
        </Text>
      ) : (
        <Text
          italic
          c={"dimmed"}
          style={{ cursor: "default", userSelect: "none" }}
        >
          (empty)
        </Text>
      ),
    [todoReadOnly.content]
  );

  return (
    <>
      <ActionIcon onClick={completeTodo}>
        {todoReadOnly.completed ? (
          <IconCheckbox color={theme.colors.gray[6]} />
        ) : (
          <IconSquare color={theme.colors.gray[6]} />
        )}
      </ActionIcon>
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
        <StyledTextDiv onClick={onOpenTodo}>{textContent}</StyledTextDiv>
      </Tooltip>
      {showAvatar && (
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
      )}
      <Menu>
        <Menu.Target>
          <ActionIcon>
            <IconDotsVertical color={theme.colors.gray[6]} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item icon={<IconTrash />} onClick={deleteTodo}>
            Delete
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={() => moveToList(undefined)}
            icon={!todo.listId && <IconCheck size={16} />}
          >
            Uncategorized
          </Menu.Item>
          {lists.map((l) => (
            <Menu.Item
              onClick={() => moveToList(l.id)}
              icon={todo.listId === l.id && <IconCheck size={16} />}
            >
              {l.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
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
