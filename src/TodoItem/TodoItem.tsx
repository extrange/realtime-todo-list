import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import { Flex } from "@mantine/core";
import React from "react";
import { Todo } from "../useSyncedStore";
import { TodoItemInternal } from "./TodoItemInternal";

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

export type TodoItemCommonProps = {
  todo: Todo;
};

export type TodoItemAdditionalProps =
  | {
      /** Whether the Todo is being dragged */
      dragging?: false;
      setEditingId: React.Dispatch<React.SetStateAction<string | undefined>>;
    }
  | {
      dragging: true;
      setEditingId?: never;
    };

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
  (props: TodoItemAdditionalProps & TodoItemCommonProps) => {
    const { dragging, todo } = props;

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
