import styled from "@emotion/styled";
import { Flex } from "@mantine/core";
import { IconCalendarDue, IconSparkles } from "@tabler/icons-react";
import { compareAsc, differenceInCalendarDays } from "date-fns";
import React, { useMemo } from "react";
import { TodoItem } from "../TodoItem/TodoItem";
import { useAppStore } from "../appStore/appStore";
import { useSettingsStore } from "../appStore/settingsStore";

const Header = styled(Flex)`
  border-bottom: 0.0625rem solid rgb(55, 58, 64);
  padding: 10px;
  user-select: none;
  background-color: ${({ theme }) => theme.colors.dark[5]};
`;

/**Due/overdue and upcoming todos, unsortable. */
export const TodoViewDueUpcoming = React.memo(() => {
  const upcomingDays = useSettingsStore((state) => state.upcomingDays);

  const dueTodos = useAppStore((state) => state.dueTodos);
  const upcomingTodos = useAppStore((state) => state.upcomingTodos);
  const focusTodos = useAppStore((state) => state.focusTodos);

  const focusTodoIdsSet = useMemo(
    () => new Set(focusTodos.map((t) => t.id)),
    [focusTodos]
  );

  const filteredDueTodos = useMemo(
    () =>
      dueTodos
        // Don't show due todos which are already in focus
        .filter((t) => !focusTodoIdsSet.has(t.id))

        // Sort by most overdue first
        .sort((a, b) =>
          compareAsc(Date.parse(a.dueDate), Date.parse(b.dueDate))
        ),
    [dueTodos, focusTodoIdsSet]
  );

  const filteredUpcomingTodos = useMemo(
    () =>
      upcomingTodos
        // Don't show upcoming todos which are already in focus
        .filter((t) => !focusTodoIdsSet.has(t.id))

        // Filter based on upcomingDays setting
        .filter(
          (t) =>
            differenceInCalendarDays(Date.parse(t.dueDate), new Date()) <=
            upcomingDays
        )

        //sort by most overdue first
        .sort((a, b) =>
          compareAsc(Date.parse(a.dueDate), Date.parse(b.dueDate))
        ),
    [upcomingTodos, focusTodoIdsSet, upcomingDays]
  );

  return (
    <>
      <Header>
        <IconCalendarDue style={{ marginRight: 5 }} />
        Due
      </Header>
      {filteredDueTodos.map((t) => (
        <TodoItem todo={t} key={t.id} />
      ))}
      <Header>
        <IconSparkles style={{ marginRight: 5 }} />
        Upcoming
      </Header>
      {filteredUpcomingTodos.map((t) => (
        <TodoItem todo={t} key={t.id} />
      ))}
    </>
  );
});

TodoViewDueUpcoming.displayName = "TodoViewDue";
