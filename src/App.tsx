import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
  Affix,
  AppShell,
  Aside,
  Container,
  Flex,
  Footer,
  MediaQuery,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { AddTodo } from "./AddTodo";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";
import { Task } from "./Task";
import "./editor.css";
import { ReloadPrompt } from "./reloadPrompt";
import { Todo, useSyncedStore } from "./store";
import { getMaxSortOrder, todoComparator } from "./util";

/* TODO Fractional indexing needs to:
- Generate keys for all tasks without keys, maintaining their current order
- This must take into account the possibility that some tasks might have keys, and some might not (e.g. incomplete sync)
- The sort method should default to not sorting if not all keys have a sort index.
- The create task method must generate a valid index
- If two keys have the same index (possible, if two clients create tasks indepedentnly while offline), then arbitrarily change one of them to the midpoint of the others. This check should run on dragEnd events, but only if the items it is being inserted between have the same index (not for the whole array).
*/

export type User = {
  name: string;
  color: string;
};

export const App = () => {
  const [editingId, setEditingId] = useState<string>();
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string>();

  const state = useSyncedStore();
  const theme = useMantineTheme();

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

  const close = () => {
    setEditingId(undefined);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(undefined);

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
      <ReloadPrompt />
      <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <ActionIcon
          color={theme.primaryColor}
          variant="filled"
          size={"xl"}
          onClick={createTodo}
        >
          <IconPlus />
        </ActionIcon>
      </Affix>

      {/* Main content starts here */}
      <AppShell
        padding="md"
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={<AppNavbar navOpen={navOpen} />}
        header={<AppHeader navOpen={navOpen} setNavOpen={setNavOpen} />}
        footer={
          <Footer height={20}>
            Show user online status here, maybe even network status
          </Footer>
        }
        aside={
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
              <Text>Application sidebar</Text>
            </Aside>
          </MediaQuery>
        }
      >
        <Flex direction={"column"}>
          {editingId && <AddTodo editingId={editingId} close={close} />}
          <Container>
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              collisionDetection={closestCenter}
            >
              <SortableContext
                items={todoIds}
                strategy={verticalListSortingStrategy}
              >
                {sortedTodos.map((todo) => (
                  <Task setEditingId={setEditingId} todo={todo} key={todo.id} />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId && (
                  <Task
                    dragging
                    todo={state.todos.find((t) => t.id === activeId) as Todo}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </Container>
        </Flex>
      </AppShell>
    </>
  );
};
