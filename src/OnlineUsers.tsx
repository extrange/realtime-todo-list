import { Accordion } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { useMemo, useState } from "react";
import { UserStatus } from "./UserStatus";
import { getUserStatus } from "./getUserStatus";
import { useAwareness } from "./useAwareness";
import { useStore } from "./useStore";
import { UserData } from "./types/UserData";

const sortUsers = <T extends UserData>(users: Map<string, T>) =>
	[...users].sort(
		([, v1], [, v2]) => (v2?.lastActive || 0) - (v1?.lastActive || 0),
	);

export const OnlineUsers = React.memo(() => {
	const awareness = useAwareness();
	const store = useStore();
	const storedUsers = useSyncedStore(store.storedUsers);
	const [open, setOpen] = useState<string | null>(null);

	// FIXME Cannot use useMemo here, need to use observeDeep
	const { onlineUsers, offlineUsers } = getUserStatus(awareness, storedUsers);

	const onlineUsersPanel = useMemo(
		() => [
			...sortUsers(onlineUsers).map(([k, userData]) => (
				<UserStatus key={k} online userData={userData} />
			)),
		],
		[onlineUsers],
	);

	const offlineUsersPanel = useMemo(
		() =>
			open && [
				...sortUsers(offlineUsers).map(([k, userData]) => (
					<UserStatus key={k} userData={userData} />
				)),
			],
		[offlineUsers, open],
	);

	const accordionStyle = useMemo(
		() => ({
			label: { padding: 0 },
			control: { height: 30 },
			content: { padding: 0 },
		}),
		[],
	);

	return (
		<>
			{onlineUsersPanel}
			<Accordion styles={accordionStyle} value={open} onChange={setOpen}>
				<Accordion.Item value="offline">
					<Accordion.Control>Offline ({offlineUsers.size})</Accordion.Control>
					<Accordion.Panel>{offlineUsersPanel}</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</>
	);
});

OnlineUsers.displayName = "OnlineUsers";
