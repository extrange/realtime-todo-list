import { Center, Footer, Text } from "@mantine/core";
import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";
import { NetworkOverlay } from "./NetworkOverlay";
import { useRerenderDaily } from "./useRerenderDaily";
import { selectTodos, useSyncedStoreCustomImpl } from "./useSyncedStore";

export const AppFooter = () => {
  const todos = useSyncedStoreCustomImpl(selectTodos, 5000);

  const time = useRerenderDaily();

  const todosDueToday = useMemo(
    () =>
      todos.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          differenceInCalendarDays(time, Date.parse(t.dueDate)) === 0
      ).length,
    [time, todos]
  );

  const todosOverdue = useMemo(
    () =>
      todos.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          differenceInCalendarDays(time, Date.parse(t.dueDate)) > 0
      ).length,
    [time, todos]
  );

  const dueString = useMemo(() => {
    if (!todosDueToday && !todosOverdue) return "No todos due";

    const todosDueTodayStr = `${todosDueToday} todo${
      todosDueToday !== 1 ? "s" : ""
    } due today`;

    const todosOverdueStr = `${todosOverdue} todo${
      todosOverdue !== 1 ? "s" : ""
    } overdue`;

    if (todosDueToday && todosOverdue)
      return `${todosDueTodayStr} (${todosOverdue} overdue)`;

    if (!todosDueToday && todosOverdue) return todosOverdueStr;

    if (todosDueToday && !todosOverdue) return todosDueTodayStr;
  }, [todosDueToday, todosOverdue]);

  return (
    <Footer height={30}>
      <Center h="100%">
        <Text c="dimmed" fz="sm">
          {dueString}
        </Text>
      </Center>
      <NetworkOverlay />
    </Footer>
  );
};
