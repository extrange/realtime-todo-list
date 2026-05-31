import {
	ActionIcon,
	Button,
	Divider,
	Modal,
	NumberInput,
	Stack,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStore } from "../appStore/settingsStore";
import { SAVED_ROOMS_LOCALSTORAGE_KEY } from "../constants";
import { downloadJson, exportData } from "../Import/util";
import type { SavedRooms } from "../Login";
import { useIsReadOnly } from "../useIsReadOnly";
import { useStore } from "../useStore";
import classes from "./Settings.module.css";

type InputProps = {
	closeNav: () => void;
};

/**Button and modal for accessing settings */
export const Settings = React.memo(({ closeNav }: InputProps) => {
	const [opened, { open, close }] = useDisclosure(false);

	// At present, this will cause a rerender on every setting change
	const {
		hideDueTodos,
		hideDueTodosDays,
		hideRepeating,
		upcomingDays,
		setUpcomingDays,
		setHideDueTodos,
		setHideRepeating,
		setHideDueTodosDays,
	} = useSettingsStore();

	const store = useStore();
	const { isReadOnly, nextRoomId } = useIsReadOnly();
	const [, setSavedRooms] = useLocalStorage<SavedRooms>({
		key: SAVED_ROOMS_LOCALSTORAGE_KEY,
		defaultValue: {},
	});

	const onClickOpen = useCallback(() => {
		open();
		closeNav();
	}, [closeNav, open]);

	const onDaysChange = useCallback(
		// If empty string is given, default to 0
		(days: number | string) => setHideDueTodosDays(Number(days)),
		[setHideDueTodosDays],
	);

	const onHideDueTodosChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setHideDueTodos(e.currentTarget.checked),
		[setHideDueTodos],
	);

	const onHideRepeatingChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setHideRepeating(e.currentTarget.checked),
		[setHideRepeating],
	);

	const onUpcomingChange = useCallback(
		(days: number | string) =>
			// Do not allow days < 1
			setUpcomingDays(Number(days) < 1 ? 1 : Number(days)),
		[setUpcomingDays],
	);

	const handleMigrate = useCallback(() => {
		const newRoomId = uuidv4();

		// Add to saved rooms so it appears when switching
		setSavedRooms((s) => ({ ...s, [newRoomId]: null }));

		// Export and download
		const data = exportData(store);
		downloadJson(data, `todos-migration-${newRoomId.slice(0, 8)}.json`);

		// Lock current room
		store.meta.nextRoomId = newRoomId;

		close();

		notifications.show({
			title: "Data exported & room locked",
			message:
				"A JSON file has been downloaded. Switch to the new room and import it.",
		});
	}, [close, setSavedRooms, store]);

	const handleClearLock = useCallback(() => {
		store.meta.nextRoomId = undefined;
		close();
		notifications.show({
			title: "Migration lock cleared",
			message: "This room is no longer read-only.",
		});
	}, [close, store.meta]);

	return (
		<>
			<Tooltip label="Settings">
				<ActionIcon size="lg" onClick={onClickOpen} variant="light" ml={10}>
					<IconSettings />
				</ActionIcon>
			</Tooltip>
			<Modal opened={opened} onClose={close} title="Settings" size={"lg"}>
				<div className={classes.grid}>
					<Switch checked={hideDueTodos} onChange={onHideDueTodosChange} />
					<Text component="div">
						Hide todos due more than
						<NumberInput
							allowDecimal={false}
							value={hideDueTodosDays}
							onChange={onDaysChange}
							hideControls
							min={0}
							maw={50}
							mx={10}
							display={"inline-block"}
						/>
						day(s) away
						<Tooltip
							multiline
							maw={300}
							label="Todos without due dates will still be shown. Will not affect todos marked Focus from showing in the Focus/Due list."
						>
							<IconInfoCircle
								style={{
									flexShrink: 0,
									verticalAlign: "middle",
									margin: "0 5px",
								}}
							/>
						</Tooltip>
					</Text>

					<Switch checked={hideRepeating} onChange={onHideRepeatingChange} />
					<Text>
						Hide repeating todos that are not yet due
						<Tooltip
							multiline
							maw={300}
							label="Will not affect todos marked Focus from showing in the Focus/Due list."
						>
							<IconInfoCircle
								style={{
									flexShrink: 0,
									verticalAlign: "middle",
									margin: "0 5px",
								}}
							/>
						</Tooltip>
					</Text>

					<div />
					<Text component="div">
						Upcoming: Show todos due in the next
						<NumberInput
							allowDecimal={false}
							value={upcomingDays}
							onChange={onUpcomingChange}
							hideControls
							min={1}
							maw={50}
							mx={10}
							display={"inline-block"}
						/>
						day(s)
					</Text>
				</div>

				<Text mt={10} c="dimmed">
					Filters will be applied sequentially to each todo.
				</Text>

				<Divider my="lg" />
				<Text fw={500} mb="xs">
					Migration
				</Text>

				{isReadOnly ? (
					<Stack>
						<Text size="sm">
							This room is locked for migration. Data has been exported.
						</Text>
						<TextInput
							readOnly
							value={nextRoomId ?? ""}
							label="Target room ID"
						/>
						<Button variant="light" color="yellow" onClick={handleClearLock}>
							Clear lock
						</Button>
					</Stack>
				) : (
					<Stack>
						<Text size="sm">
							Export all data and lock this room for migration to a fresh room.
							A JSON file will be downloaded automatically.
						</Text>
						<Button onClick={handleMigrate}>Migrate & Export</Button>
					</Stack>
				)}
			</Modal>
		</>
	);
});

Settings.displayName = "Settings";
