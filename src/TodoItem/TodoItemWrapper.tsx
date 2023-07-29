import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import { Flex } from "@mantine/core";
import React, { useMemo } from "react";
import { Todo } from "../useSyncedStore";
import { TodoItem } from "./TodoItem";

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
export const TodoItemWrapper = React.memo(
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

    const style = useMemo(
      () =>
        ({
          transform: CSS.Transform.toString(transform),
          transition,

          // isDragging: the 'shadow' of the active item (follows overlay)
          ...(isDragging && { opacity: 0.5, cursor: "grab" }),

          // dragging: the overlay of the dragged thing
          ...(dragging && {
            "--scale": 1.05,
            backgroundColor: "rgb(44, 46, 51)",
          }),
        } as React.CSSProperties),
      [dragging, isDragging, transform, transition]
    );

    return (
      <StyledFlex {...listeners} ref={setNodeRef} {...attributes} style={style}>
        <TodoItem {...props} />
      </StyledFlex>
    );
  }
);

TodoItemWrapper.displayName = "TodoItemWrapper";
