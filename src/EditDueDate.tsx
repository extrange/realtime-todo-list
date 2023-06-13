import { Group, NumberInput } from "@mantine/core";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { formatISO } from "date-fns";
import { useCallback, useMemo } from "react";
import { useStore } from "./useStore";
import { Store, useSyncedStore } from "./useSyncedStore";

type InputProps = {
  todoId: string;
};

/**Flexbox containing inputs for editing the due date and p */
export const EditDueDate = ({ todoId }: InputProps) => {
  const selectTodo = useCallback(
    (s: MappedTypeDescription<Store>) => s.todos.find((t) => t.id === todoId),
    [todoId]
  );
  const store = useStore();
  const todo = useMemo(() => selectTodo(store), [selectTodo, store]);
  const todoReadOnly = useSyncedStore(selectTodo);

  if (!todo || !todoReadOnly)
    throw Error(`EditDueDate: Could not find todo with id ${todoId}`);

  const currentDate = useMemo(
    () =>
      todoReadOnly.dueDate ? new Date(Date.parse(todoReadOnly.dueDate)) : null,
    [todoReadOnly.dueDate]
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
    <Group>
      <DatePickerInput
        label="Due"
        clearable
        dropdownType="modal"
        value={currentDate}
        onChange={onDueDateChange}
      />
      <NumberInput
        label="Repeat days"
        value={todoReadOnly.repeatDays}
        onChange={onRepeatDaysChange}
      />
    </Group>
  );
};
