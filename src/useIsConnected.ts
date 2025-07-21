import { useEffect, useState } from "react";
import { FORCE_SYNC_INTERVAL } from "./constants";
import { useProvider } from "./useProvider";

/**
 * Uses FORCE_SYNC_INTERVAL to determine whether the user is connected.
 *
 * This resolves all the issues with `Provider.synced` and `Provider.unsyncedChanges`.
 *
 * Notes:
 * - Causes re-renders
 *
 * @returns whether the client is truly connected to the server
 */
export const useIsConnected = () => {
	const provider = useProvider();

	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const interval = setInterval(
			() =>
				Date.now() -
					provider.configuration.websocketProvider.lastMessageReceived >
				FORCE_SYNC_INTERVAL
					? setIsConnected(false)
					: setIsConnected(true),
			3000,
		);
		return () => clearInterval(interval);
	}, [provider]);

	return isConnected;
};
