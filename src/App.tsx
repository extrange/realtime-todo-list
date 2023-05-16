import styled from "@emotion/styled";
import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Table,
  Text,
  Tooltip
} from "@mantine/core";
import { IconCheckbox, IconSquare, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { useSyncedStore } from "../node_modules/@syncedstore/react";
import { AddTodo } from "./AddTodo";
import { Todo, store } from "./store";

const StyledTextDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding-left: 10px;
`;

export const App = () => {
  const [editingId, setEditingId] = useState<string>();
  const state = useSyncedStore(store);

  const createTodo = () => {
    const now = Date.now();
    const newTodo: Todo = {
      id: uuidv4(),
      completed: false,
      content: new XmlFragment(),
      created: now,
      modified: now,
    };
    setEditingId(newTodo.id);
    store.todos.push(newTodo);
  };

  const toggleCompleted = (todo: Todo) => (todo.completed = !todo.completed);

  const close = () => setEditingId(undefined);

  return (
    <Container>
      <Text fz={"xl"} ta={"center"}>
        Tasks
      </Text>
      <Button onClick={createTodo}>Add Task</Button>
      {editingId && <AddTodo editingId={editingId} close={close} />}
      <Table highlightOnHover>
        <tbody>
          {state.todos.map((todo) => {
            return (
              <tr key={todo.id}>
                <td>
                  <Container
                    px={5}
                    style={{
                      marginLeft: "unset",
                      height: "2.5rem",
                      flexGrow: 1,
                    }}
                    fluid
                  >
                    <Flex
                      align={"center"}
                      style={{ height: "100%" }}
                      justify={"space-between"}
                    >
                      <ActionIcon onClick={() => toggleCompleted(todo)}>
                        {todo.completed ? <IconSquare /> : <IconCheckbox />}
                      </ActionIcon>
                      <Tooltip
                        openDelay={500}
                        multiline
                        position={"bottom"}
                        label={
                          <div>
                            <Text>
                              Modified{" "}
                              <ReactTimeAgo date={new Date(todo.modified)} />
                            </Text>
                            <Text>
                              Created{" "}
                              <ReactTimeAgo date={new Date(todo.created)} />
                            </Text>
                          </div>
                        }
                      >
                        <StyledTextDiv onClick={() => setEditingId(todo.id)}>
                          <Text>{todo.content.toDOM().textContent}</Text>
                        </StyledTextDiv>
                      </Tooltip>
                      <ActionIcon>
                        <IconTrash />
                      </ActionIcon>
                    </Flex>
                  </Container>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};
