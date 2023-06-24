import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
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
  Center,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React, { SetStateAction, useCallback, useMemo, useState } from "react";
import { DeepReadonly } from "ts-essentials";
import { CompletedTodos } from "./CompletedTodos";
import { TodoItem } from "./TodoItem";
import { useStore } from "./useStore";
import { Todo } from "./useSyncedStore";
import { generateKeyBetweenSafe } from "./util";

type InputProps = {
  /**List of filtered and sorted todos */
  todos: DeepReadonly<Todo[]>;
  /**The key to sort todos by */
  sortKey: keyof Pick<Todo, "sortOrder" | "focusSortOrder">;

  /**Function to create a new todo, specific for this view */
  createTodoFn: () => Todo;

  setEditingId: React.Dispatch<SetStateAction<string | undefined>>;
};

/**
 * Takes a list of filtered, sorted todos and displays them.
 */
export const TodoViewBase = React.memo(
  ({ todos, sortKey, createTodoFn, setEditingId }: InputProps) => {
    const theme = useMantineTheme();
    const store = useStore();

    /* The todo currently being dragged, if any */
    const [activeId, setActiveId] = useState<string>();
    const todoIds = useMemo(() => todos.map((t) => t.id), [todos]);

    /* PointerSensor causes drag-to-refresh on mobile Chrome */
    const sensors = useSensors(
      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 250,
          tolerance: 5,
        },
      }),
      useSensor(MouseSensor, {
        activationConstraint: {
          delay: 250,
          tolerance: 5,
        },
      })
    );

    const createTodo = useCallback(() => {
      const newTodo = createTodoFn();
      setEditingId(newTodo.id);
      store.todos.unshift(newTodo);
    }, [createTodoFn, setEditingId, store.todos]);

    const handleDragStart = useCallback(
      (event: DragStartEvent) => setActiveId(event.active.id.toString()),
      []
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(undefined);

        if (over && active.id !== over.id) {
          const activeTodo = store.todos.find(
            (t) => t.id === active.id
          ) as Todo;
          const overTodo = store.todos.find((t) => t.id === over.id) as Todo;

          /* If over's sortOrder > active's, user is moving the Todo to 
          somewhere above it's original positition. In this case, we want to
          move the active Todo above the over Todo, and vice versa.
          
          Note: if either of the todos don't have a sort order, we still try
          to sort anyway...*/
          const overTodoSortOrder = overTodo[sortKey];
          const activeTodoSortOrder = activeTodo[sortKey];
          if (
            overTodoSortOrder &&
            activeTodoSortOrder &&
            overTodoSortOrder > activeTodoSortOrder
          ) {
            // Find the todo above the over todo, in the sorted array
            const aboveTodo =
              todos[todos.findIndex((t) => t.id === overTodo.id) - 1];
            activeTodo[sortKey] = generateKeyBetweenSafe(
              overTodo,
              aboveTodo,
              sortKey
            );
          } else {
            // Find the todo below the over todo, in the sorted array
            const belowTodo =
              todos[todos.findIndex((t) => t.id === overTodo.id) + 1];
            activeTodo[sortKey] = generateKeyBetweenSafe(
              belowTodo,
              overTodo,
              sortKey
            );
          }
        }
      },
      [sortKey, store.todos, todos]
    );

    return (
      <>
        {/* This is a hack to make the affix stay within the scrollArea */}
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Modal zIndex is 200 */}
          <Affix
            withinPortal={false}
            sx={{ position: "absolute", pointerEvents: "auto" }}
            position={{ bottom: rem(20), right: rem(20) }}
            zIndex={50}
          >
            <ActionIcon
              color={theme.primaryColor}
              variant="filled"
              size={"xl"}
              onClick={createTodo}
            >
              <IconPlus />
            </ActionIcon>
          </Affix>
        </div>

        {/* Visible content starts here */}
        {todos.length ? (
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
              {todoIds.map((id) => (
                <TodoItem todoId={id} key={id} setEditingId={setEditingId} />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId && <TodoItem dragging todoId={activeId} />}
            </DragOverlay>
          </DndContext>
        ) : (
          <Center h={50}>
            <Text
              italic
              c={"dimmed"}
              style={{ cursor: "default", userSelect: "none" }}
            >
              No todos yet
            </Text>
          </Center>
        )}

        <CompletedTodos setEditingId={setEditingId} />
      </>
    );
  }
);
