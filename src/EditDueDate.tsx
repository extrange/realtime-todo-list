import { Group, Indicator, NumberInput } from "@mantine/core";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { useSyncedStore } from "@syncedstore/react";
import { formatISO, isToday } from "date-fns";
import { useCallback, useMemo } from "react";
import { useStore } from "./useStore";

type InputProps = {
  todoId: string;
};

/**Flexbox containing inputs for editing the due date and p */
export const EditDueDate = ({ todoId }: InputProps) => {
  const store = useStore();
  const state = useSyncedStore(store);
  const todo = useMemo(
    () => state.todos.find((t) => t.id === todoId),
    [state.todos, todoId]
  );

  if (!todo) throw Error(`EditDueDate: Could not find todo with id ${todoId}`);

  const currentDate = useMemo(
    () => (todo.dueDate ? new Date(Date.parse(todo.dueDate)) : null),
    [todo.dueDate]
  );

  const onDueDateChange = useCallback(
    (newVal: DateValue) =>
      newVal
        ? (todo.dueDate = formatISO(newVal, { representation: "date" }))
        : (todo.dueDate = undefined),
    [todo]
  );

  const onRepeatDaysChange = useCallback(
    (newVal: number | "") =>
      newVal ? (todo.repeatDays = newVal) : (todo.repeatDays = undefined),
    [todo]
  );

  return (
    <Group noWrap mb={"xs"}>
      <DatePickerInput
        sx={{ flexGrow: 1 }}
        maw={200}
        label="Due"
        placeholder="Enter a date"
        clearable
        popoverProps={{ withinPortal: true }}
        value={currentDate}
        onChange={onDueDateChange}
        renderDay={(date) => (
          <Indicator
            size={6}
            color="green"
            offset={-5}
            disabled={!isToday(date)}
          >
            <div>{date.getDate()}</div>
          </Indicator>
        )}
      />
      <NumberInput
        sx={{ flexGrow: 1 }}
        placeholder="None"
        maw={100}
        hideControls
        label="Repeat days"
        value={todo.repeatDays}
        onChange={onRepeatDaysChange}
      />
    </Group>
  );
};
