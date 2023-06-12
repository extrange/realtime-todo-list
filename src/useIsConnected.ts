import { useProviderEvent } from "./useProviderEvent";

/**
 * Use 'synced' and 'unsyncedChanges' < tolerance to determine connectivity.
 *
 * Notes:
 * - It appears (at least from UpdateStoredRoomName) safe to assume that
 * the store has been fully synced if this returns true.
 *
 * @param tolerance how many unsynced changes before considering as unsynced
 * @returns whether the client is truly connected to the server
 */
export const useIsConnected = ({ tolerance = 10 } = {}) => {
  const synced = useProviderEvent("synced");
  const unsyncedChanges = useProviderEvent("unsyncedChanges");

  return synced && unsyncedChanges < tolerance;
};
