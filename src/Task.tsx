import { useSortable } from "@dnd-kit/sortable";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import {
  IconCheckbox,
  IconGripVertical,
  IconSquare,
  IconTrash,
} from "@tabler/icons-react";

import { CSS } from "@dnd-kit/utilities";
import styled from "@emotion/styled";
import ReactTimeAgo from "react-time-ago";
import { Todo } from "./store";

const StyledTextDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 10px;
`;

type InputProps = {
  toggleCompleted: (todo: Todo) => void;
  setEditingId: (id: string) => void;
  deleteTodo: (todo: Todo) => void;
  todo: Todo;
};

export const Task = ({ setEditingId, deleteTodo, todo }: InputProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td>
        <Flex align={"center"} sx={{ padding: 0 }}>
          <IconGripVertical {...listeners} style={{ cursor: "grab" }} />
          <ActionIcon onClick={() => (todo.completed = !todo.completed)}>
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
            <StyledTextDiv onClick={() => setEditingId(todo.id)}>
              {todo.content?.toDOM().textContent ? (
                <Text
                  lineClamp={2}
                  style={{
                    overflowWrap: "anywhere",
                  }}
                >
                  {todo.content?.toDOM().textContent}
                </Text>
              ) : (
                <Text italic c={"dimmed"}>
                  (empty)
                </Text>
              )}
            </StyledTextDiv>
          </Tooltip>
          <ActionIcon
            onClick={() => confirm("Are you sure?") && deleteTodo(todo)}
          >
            <IconTrash />
          </ActionIcon>
        </Flex>
      </td>
    </tr>
  );
};
