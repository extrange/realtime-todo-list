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
  rem
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import React, {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { XmlFragment } from "yjs";
import { ListType } from "../ListContext";
import { filterTodosBasedOnSettings } from "../Settings/util";
import { TodoItem } from "../TodoItem/TodoItem";
import { TodoItemWrapper } from "../TodoItem/TodoItemWrapper";
import { useAppStore } from "../appStore/appStore";
import { useSettingsStore } from "../appStore/settingsStore";
import { TodoSlice } from "../appStore/todoSlice";
import { USER_ID } from "../constants";
import { Todo } from "../types/Todo";
import { useCurrentList } from "../useCurrentList";
import { useStore } from "../useStore";
import {
  generateKeyBetweenSafe,
  getMaxSortOrder,
  itemComparator,
} from "../util";
import classes from "./TodoView.module.css";
import { TodoViewCompleted } from "./TodoViewCompleted";
import { TodoViewDueUpcoming } from "./TodoViewDueUpcoming";

/**
 * Shows todos in selected, uncategorized, focus or completed lists.
 */
export const TodoView = React.memo(() => {

  const store = useStore();
  const [currentList] = useCurrentList();
  const setEditingId = useAppStore((state) => state.setEditingTodo);
  const setNumTodosHidden = useAppStore((state) => state.setNumTodosHidden);
  const [draggedTodoId, setDraggedTodoId] = useState<string>();

  //Settings
  const settings = useSettingsStore();

  const isFocusList = currentList === ListType.Focus;

  const selectUncompletedTodos = useCallback(
    (state: TodoSlice) =>
      isFocusList
        ? state.focusTodos
        : (state.todosMap.get(currentList)?.uncompleted as Todo[]),
    [currentList, isFocusList]
  );

  const _uncompletedTodos = useAppStore(selectUncompletedTodos);

  // Sort, filter and apply any setting-related features here
  const uncompletedTodos = useMemo(
    () =>
      // Sorting 100 todos: 1-2ms
      (isFocusList
        ? _uncompletedTodos // Don't filter the focus list
        : filterTodosBasedOnSettings({
            todos: _uncompletedTodos,
            settings,
          })
      ).sort(itemComparator(isFocusList ? "focusSortOrder" : "sortOrder")),
    [_uncompletedTodos, isFocusList, settings]
  );

  // Set and update number of hidden todos
  const numHiddenTodos = _uncompletedTodos.length - uncompletedTodos.length;
  useEffect(
    () => setNumTodosHidden(numHiddenTodos),
    [numHiddenTodos, setNumTodosHidden]
  );

  // Used by SortableContext
  const todoIds = useMemo(
    () => uncompletedTodos.map((t) => t.id),
    [uncompletedTodos]
  );

  const createTodo = useCallback((): Todo => {
    const now = Date.now();
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(store.todos, "sortOrder"),
      undefined
    );

    const focusSortOrder = isFocusList
      ? generateKeyBetween(
          getMaxSortOrder(store.todos, "focusSortOrder"),
          undefined
        )
      : undefined;

    return {
      id: uuidv4(),
      completed: false,
      content: new XmlFragment(),
      created: now,
      modified: now,
      /* Focus tasks are created in Uncategorized */
      listId: isFocusList ? undefined : currentList,
      sortOrder,
      focus: isFocusList,
      focusSortOrder,
      by: USER_ID,
    };
  }, [currentList, isFocusList, store.todos]);

  const draggedTodo = useMemo(() => {
    if (draggedTodoId) {
      const todo = uncompletedTodos.find((t) => t.id === draggedTodoId);
      if (!todo)
        throw Error(`Could not find dragging todo id ${draggedTodoId}`);
      return <TodoItem dragging todo={todo} />;
    } else return null;
  }, [draggedTodoId, uncompletedTodos]);

  /* PointerSensor causes drag-to-refresh on mobile Chrome */
  const sensorOptions = useMemo(
    /*  Memoization is necessary to prevent the DndContext from
    passing down new onMouseOver callbacks etc in lower contexts, which
    causes rerenders*/
    () => ({
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    []
  );
  const sensors = useSensors(
    useSensor(TouchSensor, sensorOptions),
    useSensor(MouseSensor, sensorOptions)
  );

  const onClickCreateTodo = useCallback(() => {
    const newTodo = createTodo();
    store.todos.unshift(newTodo);
    setEditingId(store.todos.find((t) => t.id === newTodo.id));
  }, [createTodo, setEditingId, store.todos]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => setDraggedTodoId(event.active.id.toString()),
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const sortKey: keyof Todo = isFocusList ? "focusSortOrder" : "sortOrder";
      setDraggedTodoId(undefined);

      if (over && active.id !== over.id) {
        const activeTodo = uncompletedTodos.find(
          (t) => t.id === active.id
        ) as Todo;
        const overTodo = uncompletedTodos.find((t) => t.id === over.id) as Todo;

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
            uncompletedTodos[
              uncompletedTodos.findIndex((t) => t.id === overTodo.id) - 1
            ];
          activeTodo[sortKey] = generateKeyBetweenSafe(
            overTodo,
            aboveTodo,
            sortKey
          );
        } else {
          // Find the todo below the over todo, in the sorted array
          const belowTodo =
            uncompletedTodos[
              uncompletedTodos.findIndex((t) => t.id === overTodo.id) + 1
            ];
          activeTodo[sortKey] = generateKeyBetweenSafe(
            belowTodo,
            overTodo,
            sortKey
          );
        }
      }
    },
    [isFocusList, uncompletedTodos]
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
          className={classes.affix}
          position={{ bottom: rem(20), right: rem(20) }}
          zIndex={50}
        >
          <ActionIcon
            variant="filled"
            size={"xl"}
            onClick={onClickCreateTodo}
          >
            <IconPlus />
          </ActionIcon>
        </Affix>
      </div>

      {/* Visible content starts here */}
      {uncompletedTodos.length ? (
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
            {uncompletedTodos.map((todo) => (
              <Profiler
                key={todo.id}
                id={`TodoItemWrapper ${todo.id}`}
                onRender={(id, phase, duration) =>
                  duration > 15 && console.info(id, phase, duration)
                }
              >
                <TodoItemWrapper todo={todo} key={todo.id} />
              </Profiler>
            ))}
          </SortableContext>
          <DragOverlay>{draggedTodo}</DragOverlay>
        </DndContext>
      ) : (
        <Center h={50}>
          <Text
            fs="italic"
            c={"dimmed"}
            style={{ cursor: "default", userSelect: "none" }}
          >
            No todos yet
          </Text>
        </Center>
      )}

      {/* Show due/upcoming todos only in Focus/Due */}
      {currentList === "focus" && (
        <>
          <Profiler
            id={"TodoViewDueUpcoming"}
            onRender={(id, phase, duration) =>
              duration > 5 && console.info(id, phase, duration)
            }
          >
            <TodoViewDueUpcoming />
          </Profiler>
        </>
      )}

      {/* Don't show completed todos in Focus */}
      {currentList !== "focus" && (
        <Profiler
          id={"CompletedTodos"}
          onRender={(id, phase, duration) =>
            duration > 5 && console.info(id, phase, duration)
          }
        >
          <TodoViewCompleted />
        </Profiler>
      )}
    </>
  );
});

TodoView.displayName = "TodoView";
