import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import {
  IconCheckbox,
  IconGripVertical,
  IconSquare,
  IconTrash,
} from "@tabler/icons-react";
import React from "react";
import ReactTimeAgo from "react-time-ago";
import { Todo, store } from "./store";

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
  /* border: 2px solid red; */
  border-bottom: 0.0625rem solid rgb(55, 58, 64);

  :hover {
    background-color: rgb(44, 46, 51);
  }
`;

type InputProps =
  | {
      todo: Todo;
      dragging?: false;
      setEditingId: React.Dispatch<React.SetStateAction<string | undefined>>;
    }
  | {
      todo: Todo;
      dragging: true;
      setEditingId?: never;
    };

export const Task = ({ todo, dragging, setEditingId }: InputProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,

    // isDragging: the 'shadow' of the active item (follows overlay)
    ...(isDragging && { opacity: 0.5 }),

    // dragging: the overlay of the dragged thing
    ...(dragging && {
      "--scale": 1.05,
      backgroundColor: "rgb(44, 46, 51)",
    }),
  } as React.CSSProperties;

  const deleteTodo = () =>
    confirm("Are you sure?") &&
    store.todos.splice(store.todos.indexOf(todo), 1);

  const completeTodo = () => (todo.completed = !todo.completed);

  const textContent = todo.content?.toDOM().textContent ? (
    <Text lineClamp={2} style={{ overflowWrap: "anywhere", cursor: "default" }}>
      {todo.content?.toDOM().textContent}
    </Text>
  ) : (
    <Text italic c={"dimmed"} style={{ cursor: "default" }}>
      (empty)
    </Text>
  );

  return (
    <StyledFlex align={"center"} ref={setNodeRef} {...attributes} style={style}>
      <IconGripVertical
        {...listeners}
        style={{ cursor: "grab", touchAction: "none" }}
      />
      <ActionIcon onClick={completeTodo}>
        {todo.completed ? <IconCheckbox /> : <IconSquare />}
      </ActionIcon>
      <Tooltip
        openDelay={500}
        multiline
        position={"bottom"}
        label={
          <div>
            <Text>
              Modified <ReactTimeAgo date={new Date(todo.modified)} />
            </Text>
            <Text>
              Created <ReactTimeAgo date={new Date(todo.created)} />
            </Text>
            <Text>sortOrder: {todo.sortOrder ?? "N/A"}</Text>
          </div>
        }
      >
        <StyledTextDiv onClick={() => !dragging && setEditingId(todo.id)}>
          {textContent}
        </StyledTextDiv>
      </Tooltip>
      <ActionIcon onClick={deleteTodo}>
        <IconTrash />
      </ActionIcon>
    </StyledFlex>
  );
};
