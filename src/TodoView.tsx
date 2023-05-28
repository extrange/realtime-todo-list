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
  Container,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { EditTodo } from "./EditTodo";
import { Task } from "./Task";
import { Todo, store, useSyncedStore } from "./store";
import { getMaxSortOrder, todoComparator } from "./util";

export const TodoView = () => {
  const [editingId, setEditingId] = useState<string>();
  const [activeId, setActiveId] = useState<string>();

  const theme = useMantineTheme();

  useSyncedStore();

  // TODO Memoize once syncedStore issue is fixed
  // https://github.com/YousefED/SyncedStore/issues/105
  const sortedTodos = store.todos.slice().sort(todoComparator);
  const todoIds = sortedTodos.map((t) => t.id);

  const sensors = useSensors(useSensor(PointerSensor));

  const createTodo = () => {
    const now = Date.now();
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(store.todos),
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
    store.todos.unshift(newTodo);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(undefined);

    if (over && active.id !== over.id) {
      const activeTodo = store.todos.find((t) => t.id === active.id) as Todo;
      const overTodo = store.todos.find((t) => t.id === over.id) as Todo;

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

  return editingId ? (
    <EditTodo editingId={editingId} setEditingId={setEditingId} />
  ) : (
    <>
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
                todo={store.todos.find((t) => t.id === activeId) as Todo}
              />
            )}
          </DragOverlay>
        </DndContext>
      </Container>
    </>
  );
};
