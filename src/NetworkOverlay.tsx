import { Badge, Center, Loader, Overlay, Transition } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import React, { useEffect, useMemo, useState } from "react";
import classes from "./NetworkOverlay.module.css";
import { useIsConnected } from "./useIsConnected";

/**Handles reconnection, and shows an overlay.
 *
 * Shows offline (no connection), reconnecting and nothing (when connected).
 *
 * Takes up 100% of parent height and width.
 */
export const NetworkOverlay = React.memo(() => {
	const isConnected = useIsConnected();
	const { online } = useNetwork();

	/* Controls transition when moving from true to false */
	const [justReconnected, setJustReconnected] = useState(false);

	useEffect(() => {
		if (!isConnected) return;
		setJustReconnected(true);
		const timer = setTimeout(() => setJustReconnected(false), 3000);
		return () => clearTimeout(timer);
	}, [isConnected]);

	const connected = useMemo(
		() => (
			<Badge variant="filled" color="green">
				Connected!
			</Badge>
		),
		[],
	);
	const reconnecting = useMemo(
		() => (
			<Badge
				color="orange"
				variant="filled"
				classNames={{ label: classes.badge }}
			>
				Reconnecting
				<Loader type="dots" size="xs" ml={5} color="white" />
			</Badge>
		),
		[],
	);
	const offline = useMemo(
		() => (
			<Badge variant="filled" color="red">
				Offline
			</Badge>
		),
		[],
	);

	return (
		/* Show if: justReconnected, or reconnecting/offline */
		<Transition transition={"fade"} mounted={justReconnected || !isConnected}>
			{(styles) => (
				<Overlay color="red" blur={2} style={styles} backgroundOpacity={0}>
					<Center h="100%">
						{isConnected
							? connected
							: online && !isConnected
								? reconnecting
								: offline}
					</Center>
				</Overlay>
			)}
		</Transition>
	);
});
