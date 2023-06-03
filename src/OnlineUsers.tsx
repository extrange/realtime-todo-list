import { ScrollArea } from "@mantine/core";
import { UserStatus } from "./UserStatus";
import { getUserStatus } from "./getUserStatus";
import { useSyncedStore } from "./store";
import { useAwareness } from "./useAwareness";

export const OnlineUsers = () => {
  const awareness = useAwareness();
  const storedUsers = useSyncedStore((s) => s.storedUsers, 1000);

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
