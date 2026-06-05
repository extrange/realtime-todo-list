import { Box, Text, UnstyledButton, useMantineTheme } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { useSearchStore } from "../appStore/searchStore";

type InputProps = {
	closeNav: () => void;
};

export const SearchTrigger = React.memo(({ closeNav }: InputProps) => {
	const theme = useMantineTheme();
	const openSearch = useSearchStore((s) => s.openSearch);

	const onClick = useCallback(() => {
		closeNav();
		openSearch();
	}, [closeNav, openSearch]);

	return (
		<UnstyledButton
			onClick={onClick}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "6px 10px",
				borderRadius: theme.radius.sm,
				border: "1px solid var(--mantine-color-default-border)",
				backgroundColor: "var(--mantine-color-default)",
				width: "100%",
			}}
		>
			<IconSearch size={14} style={{ opacity: 0.5 }} />
			<Text c="dimmed" size="sm" style={{ flex: 1 }}>
				Search todos…
			</Text>
			<Box
				style={{
					border: "1px solid var(--mantine-color-default-border)",
					borderRadius: 4,
					padding: "0 4px",
				}}
			>
				<Text size="xs" c="dimmed">
					/
				</Text>
			</Box>
		</UnstyledButton>
	);
});

SearchTrigger.displayName = "SearchTrigger";
