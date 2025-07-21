import {
	AppShell,
	ScrollArea,
	Transition,
	useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { type CSSProperties, useCallback } from "react";
import { OnlineUsers } from "./OnlineUsers";

type InputProps = {
	asideOpen?: boolean;
};

/**
 * Shows user online/active status, and recently viewed todos.
 */
export const AppAside = React.memo(({ asideOpen }: InputProps) => {
	const theme = useMantineTheme();
	const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

	const render = useCallback(
		(styles?: CSSProperties) => (
			<AppShell.Aside style={styles} p="none">
				<ScrollArea>
					<OnlineUsers />
				</ScrollArea>
			</AppShell.Aside>
		),
		[],
	);

	return (
		<Transition
			keepMounted
			mounted={isDesktop || !!asideOpen}
			transition="slide-left"
		>
			{render}
		</Transition>
	);
});

AppAside.displayName = "AppAside";
