import { Store, USER_ID, UserData } from "./store";
import { AwarenessMap, AwarenessState } from "./useAwareness";

/**
 * Represents the state of the current user, with certain (possibly)
 * multi-valued properties reduced.
 */
export type OnlineUser = UserData & {
  editingIds: Set<NonNullable<AwarenessState["editingId"]>>;
};

export type OfflineUser = UserData;

/**Return T with properties in K marked as required. */
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Looks up userIds in an AwarenessMap from storedUsers, separates users
 * into online and offline, and for online users, appends the
 * appropriate UserData and reduces multi-valued properties.
 *
 * **Notes regarding online users**
 *
 * We may have duplicate Users, such as users using multiple tabs (or
 * in the future, multiple logins across devices). We need to 'reduce'
 * such multi-valued properties to valid values.
 *
 * lastActive is already 'reduced', as clients update any changes to
 * localStorage, which is then synced to storedUsers.
 *
 * For now, we reduce editingId, by converting it to an array.
 */
export const getUserStatus = (
  awareness: AwarenessMap,
  storedUsers: Partial<Store["storedUsers"]>
): {
  onlineUsers: Map<string, OnlineUser>;
  offlineUsers: Map<string, OfflineUser>;
} => {
  const onlineUsers = new Map<string, OnlineUser>();

  [...awareness.entries()]
    // Exclude ourselves
    .filter(([, v]) => v.userId !== USER_ID)

    // Exclude awareness entries missing UserId (e.g. from old clients)
    .filter(
      (e): e is [number, WithRequired<AwarenessState, "userId">] =>
        !!e[1].userId
    )

    // Exclude awareness entries where userData can't be found
    .filter(([, v]) => !!storedUsers[v.userId])

    .forEach(([, v]) => {
      const userId = v.userId;
      const onlineUser = onlineUsers.get(userId);

      if (!onlineUser) {
        // UserId not yet seen, add it
        const userData = storedUsers[v.userId] as UserData;
        onlineUsers.set(userId, {
          editingIds: new Set(v.editingId ? [v.editingId] : undefined),
          user: userData.user,
          lastActive: userData.lastActive,
        });
      } else {
        // UserId exists. Reduce properties here

        // editingId: Add only if present
        v.editingId && onlineUser.editingIds.add(v.editingId);
      }
    });

  /* Note: if a user has both offline and online states, the online state
  will be selected preferentially. */
  const offlineUsers = new Map(
    Object.entries(storedUsers)

      // Filter ourselves
      .filter(([k]) => k !== USER_ID)

      // Filter empty storedUsers
      .filter((e): e is [string, UserData] => !!e[1])

      // Filter out online users
      .filter(([k]) => !onlineUsers.has(k))
  );

  return { onlineUsers, offlineUsers };
};
