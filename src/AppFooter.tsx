import { Badge, Flex, Footer, Text } from "@mantine/core";
import { getUserStatus } from "./getUserStatus";
import { useSyncedStore } from "./store";
import { useAwareness } from "./useAwareness";

export const AppFooter = () => {
  const awareness = useAwareness();
  const storedUsers = useSyncedStore((s) => s.storedUsers, 300);
  const { onlineUsers } = getUserStatus(awareness, storedUsers);

  return (
    <Footer height={30}>
      <Flex align={"center"}>
        <Text>Users online: </Text>
        {[...onlineUsers.values()].map((v) => (
          <Badge c={"dark"} bg={v.user?.color}>
            {v.user?.name}
          </Badge>
        ))}
      </Flex>
    </Footer>
  );
};
