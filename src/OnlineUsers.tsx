import { ScrollArea } from "@mantine/core";
import { UserStatus } from "./UserStatus";
import { getUserStatus } from "./getUserStatus";
import { useAwareness } from "./useAwareness";
import { selectStoredUsers, useSyncedStore } from "./useSyncedStore";

export const OnlineUsers = () => {
  const awareness = useAwareness();
  const storedUsers = useSyncedStore(selectStoredUsers);

  const { onlineUsers, offlineUsers } = getUserStatus(awareness, storedUsers);

  return (
    <ScrollArea>
      {[...onlineUsers.entries()].map(([k, userData]) => (
        <UserStatus key={k} online userData={userData} />
      ))}
      {[...offlineUsers.entries()].map(([k, userData]) => (
        <UserStatus key={k} userData={userData} />
      ))}
    </ScrollArea>
  );
};
