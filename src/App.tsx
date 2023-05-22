import styled from "@emotion/styled";
import {
  ActionIcon,
  Button,
  Code,
  ColorPicker,
  Container,
  Flex,
  Modal,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBrandGithub,
  IconCheckbox,
  IconInfoCircle,
  IconPencil,
  IconSquare,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { useSyncedStore } from "../node_modules/@syncedstore/react";
import { AddTodo } from "./AddTodo";
import "./editor.css";
import { NetworkStatus } from "./networkStatus";
import { ReloadPrompt } from "./reloadPrompt";
import { Todo, store } from "./store";

const StyledTextDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 10px;
`;

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

export type User = {
  name: string;
  color: string;
};

const RELEASE_DATE = new Date(import.meta.env.VITE_COMMIT_DATE);

const getInitialUser = (): User => {
  const user = localStorage.getItem("user");
  const generatedUser = {
    name: `User ${uuidv4().slice(0, 6)}`,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
  if (!user) {
    localStorage.setItem("user", JSON.stringify(generatedUser));
  }
  return user ? JSON.parse(user) : generatedUser;
};

export const App = () => {
  const [editingId, setEditingId] = useState<string>();
  const [user, setUser] = useState<User>(getInitialUser());
  const [editUser, setEditUser] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const userForm = useForm({
    initialValues: user,
  });

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
    store.todos.unshift(newTodo);
  };

  const deleteTodo = (todo: Todo) =>
    store.todos.splice(store.todos.indexOf(todo), 1);

  const toggleCompleted = (todo: Todo) => (todo.completed = !todo.completed);

  const close = () => {
    setEditingId(undefined);
  };

  const onEditUserClose = () => {
    setEditUser(false);
    setUser(userForm.values);
    localStorage.setItem("user", JSON.stringify(userForm.values));
  };

  return (
    <>
      <Modal opened={editUser} onClose={onEditUserClose} returnFocus={false}>
        <Container>
          <Text ta={"center"} c={userForm.values.color}>
            {userForm.values.name}
          </Text>
          <TextInput data-autofocus {...userForm.getInputProps("name")} />
          <ColorPicker
            format={"hex"}
            swatches={colors}
            withPicker={false}
            fullWidth
            {...userForm.getInputProps("color")}
          />
        </Container>
      </Modal>
      <Modal
        opened={showInfo}
        onClose={() => setShowInfo(false)}
        withCloseButton={false}
      >
        <Table>
          <tbody>
            <tr>
              <td>
                <Text>Commit hash:</Text>
              </td>
              <td>
                <Code style={{ overflowWrap: "anywhere" }}>
                  {import.meta.env.VITE_COMMIT_HASH}
                </Code>
              </td>
            </tr>
            <tr>
              <td>Released:</td>
              <td>
                {new Intl.DateTimeFormat("en-SG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Singapore",
                }).format(RELEASE_DATE)}{" "}
                (
                <ReactTimeAgo date={RELEASE_DATE} />)
              </td>
            </tr>
            <tr>
              <td>Changes:</td>
              <td>{import.meta.env.VITE_COMMIT_MSG}</td>
            </tr>
          </tbody>
        </Table>
        <Button
          leftIcon={<IconBrandGithub />}
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/extrange/realtime-todo-list"
          variant={"subtle"}
        >
          View on Github
        </Button>
      </Modal>
      <ReloadPrompt />
      <Container>
        <Flex justify={"center"} align={"center"}>
          <Text fz={"xl"} ta={"center"}>
            Tasks
          </Text>
          <ActionIcon mx={5} onClick={() => setShowInfo(true)}>
            <IconInfoCircle color={"grey"} />
          </ActionIcon>
          <NetworkStatus />
        </Flex>
        <Flex justify={"space-between"}>
          <Button variant={"subtle"} onClick={createTodo}>
            Add Task
          </Button>
          <Button
            rightIcon={<IconPencil color={"white"} />}
            variant={"subtle"}
            onClick={() => setEditUser(true)}
          >
            <Text color={user.color}>{user.name}</Text>
          </Button>
        </Flex>
        {editingId && (
          <AddTodo editingId={editingId} user={user} close={close} />
        )}
        <Table highlightOnHover sx={{ width: "100%", tableLayout: "fixed" }}>
          <tbody>
            {state.todos.map((todo) => {
              return (
                <tr key={todo.id}>
                  <td>
                    <Flex align={"center"}>
                      <ActionIcon onClick={() => toggleCompleted(todo)}>
                        {todo.completed ? <IconCheckbox /> : <IconSquare />}
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
                          {todo.content.toDOM().textContent ? (
                            <Text
                              lineClamp={2}
                              style={{
                                overflowWrap: "anywhere",
                              }}
                            >
                              {todo.content.toDOM().textContent}
                            </Text>
                          ) : (
                            <Text italic c={"dimmed"}>
                              (empty)
                            </Text>
                          )}
                        </StyledTextDiv>
                      </Tooltip>
                      <ActionIcon
                        onClick={() =>
                          confirm("Are you sure?") && deleteTodo(todo)
                        }
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Flex>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
    </>
  );
};
