import { Button, Container, Flex, Table, Text } from "@mantine/core";
import { useState } from "react";
import { SyncedXml } from "../node_modules/@syncedstore/core";
import { useSyncedStore } from "../node_modules/@syncedstore/react";
import { AddTodo } from "./AddTodo";
import { Todo, store } from "./store";

export const Provider = () => {
  const [editingId, setEditingId] = useState<string>();
  const state = useSyncedStore(store);

  const createTodo = () => {
    const now = Date.now().toString();
    const newTodo = {
      id: now,
      completed: false,
      content: new SyncedXml(),
      created: now,
      modified: now,
    };
    setEditingId(now);
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
                    <Flex align={"center"} style={{ height: "100%" }}>
                      <Button onClick={() => toggleCompleted(todo)}>
                        Toggle
                      </Button>
                      <Text onClick={() => setEditingId(todo.id)}>
                        {todo.completed ? "completed" : "not completed"}{" "}
                        {todo.content.toString()}, modified {todo.modified}
                      </Text>
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
