import { AppShell, Center, Flex, Text } from "@mantine/core";
import React from "react";
import { useAppStore } from "./appStore/appStore";
import { NetworkOverlay } from "./NetworkOverlay";

const getTodosHiddenString = (numHiddenTodos: number) => {
	if (!numHiddenTodos) return "";

	return `${numHiddenTodos} todo${numHiddenTodos !== 1 ? "s" : ""} hidden`;
};

export const AppFooter = React.memo(() => {
	const numTodosHidden = useAppStore((state) => state.numTodosHidden);
	const isRebuildingIndex = useAppStore((state) => state.isRebuildingIndex);

	return (
		<AppShell.Footer>
			<Center h="100%">
				<Flex gap="md" align="center">
					{isRebuildingIndex && (
						<Text c="dimmed" fz="xs">
							Indexing…
						</Text>
					)}
					<Text c="dimmed" fz="sm">
						{getTodosHiddenString(numTodosHidden)}
					</Text>
				</Flex>
			</Center>
			<NetworkOverlay />
		</AppShell.Footer>
	);
});

AppFooter.displayName = "AppFooter";
