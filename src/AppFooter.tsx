import { Flex, Footer } from "@mantine/core";
import { UserBadge } from "./UserBadge";
import { getUserStatus } from "./getUserStatus";
import { useSyncedStore } from "./store";
import { useAwareness } from "./useAwareness";

export const AppFooter = () => {
  const awareness = useAwareness();
  const [storedUsersReadOnly] = useSyncedStore((s) => s.storedUsers);
  const { onlineUsers } = getUserStatus(awareness, storedUsersReadOnly);

  return (
    <Footer height={30}>
      <Flex align={"center"} mx={10}>
        {[...onlineUsers.values()].map((v) => (
          <UserBadge small name={v.user?.name} color={v.user?.color} />
        ))}
      </Flex>
    </Footer>
  );
};
