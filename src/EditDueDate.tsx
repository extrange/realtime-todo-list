import { CSSObject, Group, Indicator, NumberInput } from "@mantine/core";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { useSyncedStore } from "@syncedstore/react";
import { formatISO, isToday } from "date-fns";
import React, { useCallback, useMemo } from "react";
import { useAppStore } from "./appStore/appStore";

/**Flexbox containing inputs for editing the due date and p */
export const EditDueDate = React.memo(() => {
  const _editingTodo = useAppStore((state) => state.editingTodo);

  // This reference does not change
  const editingTodo = useSyncedStore(_editingTodo);

  if (!editingTodo) throw Error(`EditDueDate: No editingTodo!`);

  const currentDate = useMemo(
    () =>
      editingTodo.dueDate ? new Date(Date.parse(editingTodo.dueDate)) : null,
    [editingTodo.dueDate]
  );

  const onDueDateChange = useCallback(
    (newVal: DateValue) =>
      newVal
        ? (editingTodo.dueDate = formatISO(newVal, { representation: "date" }))
        : (editingTodo.dueDate = undefined),
    [editingTodo]
  );

  const onRepeatDaysChange = useCallback(
    (newVal: number | "") =>
      newVal
        ? (editingTodo.repeatDays = newVal)
        : (editingTodo.repeatDays = undefined),
    [editingTodo]
  );

  const inputStyles = useMemo((): CSSObject => ({ flexGrow: 1 }), []);

  const popoverProps = useMemo(() => ({ withinPortal: true }), []);

  const renderDay = useCallback(
    (date: Date) => (
      <Indicator size={6} color="green" offset={-5} disabled={!isToday(date)}>
        <div>{date.getDate()}</div>
      </Indicator>
    ),
    []
  );

  return (
    <Group noWrap mb={"xs"}>
      <DatePickerInput
        sx={inputStyles}
        maw={200}
        label="Due"
        placeholder="Enter a date"
        clearable
        popoverProps={popoverProps}
        value={currentDate}
        onChange={onDueDateChange}
        renderDay={renderDay}
      />
      <NumberInput
        sx={inputStyles}
        placeholder="None"
        maw={100}
        hideControls
        label="Repeat days"
        value={editingTodo.repeatDays}
        onChange={onRepeatDaysChange}
      />
    </Group>
  );
});

EditDueDate.displayName = "EditDueDate";
