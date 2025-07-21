import { Accordion, useMantineTheme } from "@mantine/core";
import { IconCalendarDue, IconSparkles } from "@tabler/icons-react";
import { compareAsc, differenceInCalendarDays } from "date-fns";
import React, { useMemo } from "react";
import { useAppStore } from "../appStore/appStore";
import { useSettingsStore } from "../appStore/settingsStore";
import { Counter } from "../Counter";
import { TodoItem } from "../TodoItem/TodoItem";

/**Due/overdue and upcoming todos, unsortable. */
export const TodoViewDueUpcoming = React.memo(() => {
	const theme = useMantineTheme();
	const upcomingDays = useSettingsStore((state) => state.upcomingDays);

	const dueTodos = useAppStore((state) => state.dueTodos);
	const upcomingTodos = useAppStore((state) => state.upcomingTodos);
	const focusTodos = useAppStore((state) => state.focusTodos);

	const focusTodoIdsSet = useMemo(
		() => new Set(focusTodos.map((t) => t.id)),
		[focusTodos],
	);

	const filteredDueTodos = useMemo(
		() =>
			dueTodos
				// Don't show due todos which are already in focus
				.filter((t) => !focusTodoIdsSet.has(t.id))

				// Sort by most overdue first
				.sort((a, b) =>
					compareAsc(Date.parse(a.dueDate), Date.parse(b.dueDate)),
				),
		[dueTodos, focusTodoIdsSet],
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
						upcomingDays,
				)

				//sort by most overdue first
				.sort((a, b) =>
					compareAsc(Date.parse(a.dueDate), Date.parse(b.dueDate)),
				),
		[upcomingTodos, focusTodoIdsSet, upcomingDays],
	);

	return (
		<Accordion
			multiple
			defaultValue={["due"]}
			styles={(theme) => ({
				content: { padding: 0 },
				control: { backgroundColor: theme.colors.dark[5] },
			})}
			chevronPosition="right"
		>
			<Accordion.Item value="due">
				<Accordion.Control icon={<IconCalendarDue />}>
					Due
					{filteredDueTodos.length ? (
						<Counter
							ml={theme.spacing.sm}
							inline
							span
							count={filteredDueTodos.length}
						/>
					) : null}
				</Accordion.Control>
				<Accordion.Panel>
					{filteredDueTodos.map((t) => (
						<TodoItem todo={t} key={t.id} />
					))}
				</Accordion.Panel>
			</Accordion.Item>

			<Accordion.Item value="upcoming">
				<Accordion.Control icon={<IconSparkles />}>
					Upcoming
					{filteredUpcomingTodos.length ? (
						<Counter
							ml={theme.spacing.sm}
							inline
							span
							count={filteredUpcomingTodos.length}
						/>
					) : null}
				</Accordion.Control>
				<Accordion.Panel>
					{filteredUpcomingTodos.map((t) => (
						<TodoItem todo={t} key={t.id} />
					))}
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
});

TodoViewDueUpcoming.displayName = "TodoViewDue";
