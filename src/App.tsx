import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBrandGithub,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { AddTodo } from "./AddTodo";
import { Task } from "./Task";
import "./editor.css";
import { NetworkStatus } from "./networkStatus";
import { ReloadPrompt } from "./reloadPrompt";
import { Todo, useSyncedStore } from "./store";
import { getMaxSortOrder, todoComparator } from "./util";

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

const RELEASE_DATE = import.meta.env.VITE_COMMIT_DATE
  ? new Date(import.meta.env.VITE_COMMIT_DATE)
  : new Date();

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

/* TODO Fractional indexing needs to:
- Generate keys for all tasks without keys, maintaining their current order
- This must take into account the possibility that some tasks might have keys, and some might not (e.g. incomplete sync)
- The sort method should default to not sorting if not all keys have a sort index.
- The create task method must generate a valid index
- If two keys have the same index (possible, if two clients create tasks indepedentnly while offline), then arbitrarily change one of them to the midpoint of the others. This check should run on dragEnd events, but only if the items it is being inserted between have the same index (not for the whole array).
*/

export const App = () => {
  const [editingId, setEditingId] = useState<string>();
  const [user, setUser] = useState<User>(getInitialUser());
  const [editUser, setEditUser] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const userForm = useForm({
    initialValues: user,
  });

  const state = useSyncedStore();

  // TODO Memoize once syncedStore issue is fixed
  // https://github.com/YousefED/SyncedStore/issues/105
  const sortedTodos = state.todos.slice().sort(todoComparator);
  const todoIds = sortedTodos.map((t) => t.id);

  const sensors = useSensors(useSensor(PointerSensor));

  const createTodo = () => {
    const now = Date.now();
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(state.todos),
      undefined
    );

    const newTodo: Todo = {
      id: uuidv4(),
      completed: false,
      content: new XmlFragment(),
      created: now,
      modified: now,
      sortOrder,
    };
    setEditingId(newTodo.id);
    state.todos.unshift(newTodo);
  };

  const deleteTodo = (todo: Todo) =>
    state.todos.splice(state.todos.indexOf(todo), 1);

  const toggleCompleted = (todo: Todo) => (todo.completed = !todo.completed);

  const close = () => {
    setEditingId(undefined);
  };

  const onEditUserClose = () => {
    setEditUser(false);
    setUser(userForm.values);
    localStorage.setItem("user", JSON.stringify(userForm.values));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeTodo = state.todos.find((t) => t.id === active.id) as Todo;
      const overTodo = state.todos.find((t) => t.id === over.id) as Todo;

      /* If over's sortOrder > active's, user is moving the Todo to somewhere above it's original positition. In this case, we want to move the active Todo above the over Todo, and vice versa. */
      // TODO: for now, I'm assuming all todos have sortOrders
      if (overTodo?.sortOrder > activeTodo?.sortOrder) {
        // Find the key of the todo above the over todo, in the sorted array
        const aboveIdx =
          sortedTodos[sortedTodos.findIndex((t) => t.id === overTodo.id) - 1]
            ?.sortOrder;
        activeTodo.sortOrder = generateKeyBetween(overTodo.sortOrder, aboveIdx);
      } else {
        // Find the key of the todo below the over todo, in the sorted array
        const belowIdx =
          sortedTodos[sortedTodos.findIndex((t) => t.id === overTodo.id) + 1]
            ?.sortOrder;
        activeTodo.sortOrder = generateKeyBetween(belowIdx, overTodo.sortOrder);
      }
    }
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
        <Table highlightOnHover>
          <tbody>
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <SortableContext
                items={todoIds}
                strategy={verticalListSortingStrategy}
              >
                {sortedTodos.map((todo) => (
                  <Task
                    deleteTodo={deleteTodo}
                    toggleCompleted={toggleCompleted}
                    setEditingId={setEditingId}
                    todo={todo}
                    key={todo.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </Table>
      </Container>
    </>
  );
};
