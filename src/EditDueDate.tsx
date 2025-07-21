import { Group, Indicator, NumberInput } from "@mantine/core";
import { DatePickerInput, type DateValue } from "@mantine/dates";
import { useSyncedStore } from "@syncedstore/react";
import { formatISO, isToday } from "date-fns";
import React, { useCallback, useMemo } from "react";
import { useAppStore } from "./appStore/appStore";
import classes from "./EditDueDate.module.css";

/**Flexbox containing inputs for editing the due date and p */
export const EditDueDate = React.memo(() => {
	const _editingTodo = useAppStore((state) => state.editingTodo);

	// This reference does not change
	const editingTodo = useSyncedStore(_editingTodo);

	if (!editingTodo) throw Error(`EditDueDate: No editingTodo!`);

	const currentDate = useMemo(
		() =>
			editingTodo.dueDate ? new Date(Date.parse(editingTodo.dueDate)) : null,
		[editingTodo.dueDate],
	);

	const onDueDateChange = useCallback(
		(newVal: DateValue) => {
			if (newVal) {
				editingTodo.dueDate = formatISO(newVal, { representation: "date" });
			} else {
				editingTodo.dueDate = undefined;
			}
		},
		[editingTodo],
	);

	const onRepeatDaysChange = useCallback(
		(newVal: number | string) => {
			if (newVal) {
				editingTodo.repeatDays =
					typeof newVal === "string" ? parseInt(newVal) : newVal;
			} else {
				editingTodo.repeatDays = undefined; // empty string is falsy
			}
		},
		[editingTodo],
	);

	const popoverProps = useMemo(() => ({ withinPortal: true }), []);

	const renderDay = useCallback(
		(date: string) => (
			<Indicator size={6} color="green" offset={-5} disabled={!isToday(date)}>
				<div>{new Date(date).getDate()}</div>
			</Indicator>
		),
		[],
	);

	return (
		<Group wrap={"nowrap"} mb={"xs"}>
			<DatePickerInput
				maw={200}
				className={classes.datePickerInput}
				label="Due"
				placeholder="Enter a date"
				clearable
				popoverProps={popoverProps}
				value={currentDate}
				onChange={onDueDateChange}
				renderDay={renderDay}
			/>
			<NumberInput
				className={classes.datePickerInput}
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
