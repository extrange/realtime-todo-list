import { Center, Footer, Text } from "@mantine/core";
import { differenceInCalendarDays } from "date-fns";
import React, { useMemo } from "react";
import { NetworkOverlay } from "./NetworkOverlay";
import { useAppStore } from "./appStore";
import { useRerenderDaily } from "./useRerenderDaily";

export const AppFooter = React.memo(() => {
  // will shallow compare improve rendering time?
  const dueTodos = useAppStore((state) => state.dueTodos);

  const time = useRerenderDaily();

  const todosDueToday = useMemo(
    () =>
      dueTodos.filter(
        (t) => differenceInCalendarDays(time, Date.parse(t.dueDate)) === 0
      ).length,
    [dueTodos, time]
  );

  const todosOverdue = useMemo(
    () =>
      dueTodos.filter(
        (t) => differenceInCalendarDays(time, Date.parse(t.dueDate)) > 0
      ).length,
    [dueTodos, time]
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
});

AppFooter.displayName = "AppFooter";
