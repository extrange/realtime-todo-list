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
  Modal,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import { useCallback, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { EditTodo } from "./EditTodo";
import { Task } from "./Task";
import { Todo, store, useSyncedStore } from "./store";
import {
  generateKeyBetweenSafe,
  getMaxSortOrder,
  todoComparator,
} from "./util";

type ScrollPosition = Record<string, number>;

export const TodoView = () => {
  const [activeId, setActiveId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const dialogRef = useRef<HTMLElement | null>(null);
  const scrollPositions = useRef<ScrollPosition>({});
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const todos = useSyncedStore((s) => s.todos);

  // TODO Memoize once syncedStore issue is fixed
  // https://github.com/YousefED/SyncedStore/issues/105
  const sortedTodos = todos.slice().sort(todoComparator);

  const todoIds = sortedTodos.map((t) => t.id);

  const editingTodo = useMemo(
    // Must use store.todos here since this is passod to EditTodo
    () => store.todos.find((t) => t.id === editingId),
    [editingId]
  );

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
        // Find the todo above the over todo, in the sorted array
        const aboveTodo =
          sortedTodos[sortedTodos.findIndex((t) => t.id === overTodo.id) - 1];

        activeTodo.sortOrder = generateKeyBetweenSafe(overTodo, aboveTodo);
      } else {
        // Find the todo below the over todo, in the sorted array
        const belowTodo =
          sortedTodos[sortedTodos.findIndex((t) => t.id === overTodo.id) + 1];

        activeTodo.sortOrder = generateKeyBetweenSafe(belowTodo, overTodo);
      }
    }
  };

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

  const onDialogClose = () => {
    if (editingId && dialogRef.current) {
      scrollPositions.current[editingId] = dialogRef.current.scrollTop;
    }

    // Update last opened
    editingId && localStorage.setItem(editingId, Date.now().toString());

    setEditingId(undefined);
  };

  return (
    <>
      <Modal.Root
        opened={!!editingId}
        onClose={onDialogClose}
        fullScreen={isMobile}
        size={"min(70%, 800px)"} // Not applied if fullScreen=True
      >
        <Modal.Overlay />
        <Modal.Content ref={dialogRef}>
          <Modal.Header>
            {/* <Modal.Title>Modal title</Modal.Title> */}
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            {editingTodo && (
              <EditTodo todo={editingTodo} onCreate={onEditorCreate} />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
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

      {/* Visible content starts here */}
      <Container p={0}>
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
              <Task todo={todo} key={todo.id} setEditingId={setEditingId} />
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
