import { Accordion } from "@mantine/core";
import { useMemo } from "react";
import { UserStatus } from "./UserStatus";
import { getUserStatus } from "./getUserStatus";
import { useAwareness } from "./useAwareness";
import { UserData, selectStoredUsers, useSyncedStore } from "./useSyncedStore";

const sortUsers = <T extends UserData>(users: Map<string, T>) =>
  [...users].sort(
    ([, v1], [, v2]) => (v2?.lastActive || 0) - (v1?.lastActive || 0)
  );

export const OnlineUsers = () => {
  const awareness = useAwareness();
  const storedUsers = useSyncedStore(selectStoredUsers);

  const { onlineUsers, offlineUsers } = getUserStatus(awareness, storedUsers);

  const onlineUsersPanel = useMemo(
    () => [
      ...sortUsers(onlineUsers).map(([k, userData]) => (
        <UserStatus key={k} online userData={userData} />
      )),
    ],
    [onlineUsers]
  );

  const offlineUsersPanel = useMemo(
    () => [
      ...sortUsers(offlineUsers).map(([k, userData]) => (
        <UserStatus key={k} userData={userData} />
      )),
    ],
    [offlineUsers]
  );

  return (
    <>
      {onlineUsersPanel}
      <Accordion styles={{ label: { padding: 0 }, control: { height: 30 } }}>
        <Accordion.Item value="offline">
          <Accordion.Control>Offline ({offlineUsers.size})</Accordion.Control>
          <Accordion.Panel>{offlineUsersPanel}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
};
