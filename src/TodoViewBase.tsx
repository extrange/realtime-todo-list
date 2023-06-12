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
    Modal,
    Text,
    rem,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { DeepReadonly } from "ts-essentials";
import { CompletedTodos } from "./CompletedTodos";
import { EditTodo } from "./EditTodo";
import { Task } from "./Task";
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
};

type ScrollPosition = Record<string, number>;

/**Takes a list of filtered, sorted todos and displays them.
 * Handles editor display.
 */
export const TodoViewBase = React.memo(
  ({ todos, sortKey, createTodoFn }: InputProps) => {
    const store = useStore();

    /* The todo currently being dragged, if any */
    const [activeId, setActiveId] = useState<string>();

    const [editingId, setEditingId] = useState<string>();

    const dialogRef = useRef<HTMLElement | null>(null);
    const scrollPositions = useRef<ScrollPosition>({});
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    const todoIds = useMemo(() => todos.map((t) => t.id), [todos]);

    const editingTodo = useMemo(
      // Must use store.todos here since this is passed to EditTodo
      () => store.todos.find((t) => t.id === editingId),
      [editingId, store]
    );

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
    }, [createTodoFn, store.todos]);

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

    /* Editor has been created, so we can use scrollTo now
    Previously, using a ref callback would give the wrong height
    as the editor had not loaded yet*/
    const onEditorCreate = useCallback(() => {
      if (editingId && dialogRef.current) {
        const lastScrollPos = scrollPositions.current[editingId];
        if (lastScrollPos) dialogRef.current.scroll(0, lastScrollPos);
        else dialogRef.current.scroll(0, 0);
      }
    }, [editingId]);

    const onDialogClose = useCallback(() => {
      if (editingId && dialogRef.current) {
        scrollPositions.current[editingId] = dialogRef.current.scrollTop;
      }

      // Update last opened
      editingId && localStorage.setItem(editingId, Date.now().toString());

      setEditingId(undefined);
    }, [editingId]);

    return (
      <>
        <Modal.Root
          opened={!!editingId}
          onClose={onDialogClose}
          fullScreen={isMobile}
          size={"min(70%, 800px)"} // Not applied if fullScreen=True
          styles={{ overlay: { backdropFilter: "blur(2px)" } }}
        >
          <Modal.Overlay />
          <Modal.Content ref={dialogRef}>
            <Modal.Header>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              {editingTodo && (
                <EditTodo todo={editingTodo} onCreate={onEditorCreate} />
              )}
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>

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
                <Task todoId={id} key={id} setEditingId={setEditingId} />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId && <Task dragging todoId={activeId} />}
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
