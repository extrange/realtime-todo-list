import { AppShell, Center, Text } from "@mantine/core";
import React from "react";
import { useAppStore } from "./appStore/appStore";
import { NetworkOverlay } from "./NetworkOverlay";

const getTodosHiddenString = (numHiddenTodos: number) => {
	if (!numHiddenTodos) return "";

	return `${numHiddenTodos} todo${numHiddenTodos !== 1 ? "s" : ""} hidden`;
};

export const AppFooter = React.memo(() => {
	// will shallow compare improve rendering time?
	const numTodosHidden = useAppStore((state) => state.numTodosHidden);

	return (
		<AppShell.Footer>
			<Center h="100%">
				<Text c="dimmed" fz="sm">
					{getTodosHiddenString(numTodosHidden)}
				</Text>
			</Center>
			<NetworkOverlay />
		</AppShell.Footer>
	);
});

AppFooter.displayName = "AppFooter";
