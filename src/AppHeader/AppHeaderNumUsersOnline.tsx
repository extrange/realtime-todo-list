import { ActionIcon, Indicator, useMantineTheme } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import { IconUsers } from "@tabler/icons-react";
import React, { type SetStateAction, useCallback, useMemo } from "react";
import { getUserStatus } from "../getUserStatus";
import { useAwareness } from "../useAwareness";
import { useStore } from "../useStore";

type InputProps = {
	setAsideOpen: React.Dispatch<SetStateAction<boolean>>;
};

export const AppHeaderNumUsersOnline = React.memo(
	({ setAsideOpen }: InputProps) => {
		const theme = useMantineTheme();
		const awareness = useAwareness();
		const store = useStore();
		const storedUsers = useSyncedStore(store.storedUsers);

		// FIXME Can't memoize, have to use observeDeep
		const onlineUsers = getUserStatus(awareness, storedUsers).onlineUsers;

		const numberOnline = useMemo(() => [...onlineUsers].length, [onlineUsers]);
		const onClick = useCallback(() => setAsideOpen((o) => !o), [setAsideOpen]);

		return (
			<ActionIcon variant="subtle" onClick={onClick}>
				<Indicator disabled={!numberOnline} inline label={numberOnline}>
					<IconUsers color={theme.colors.gray[6]} />
				</Indicator>
			</ActionIcon>
		);
	},
);

AppHeaderNumUsersOnline.displayName = "AppHeaderNumUsersOnline";
