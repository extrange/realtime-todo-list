import { Center, Footer, Text } from "@mantine/core";
import { NetworkOverlay } from "./NetworkOverlay";
import { selectLists, selectTodos, useSyncedStore } from "./useSyncedStore";

export const AppFooter = () => {
  const todos = useSyncedStore(selectTodos, 5000);
  const lists = useSyncedStore(selectLists, 5000);

  return (
    <Footer height={30}>
      <Center h="100%">
        <Text c="dimmed" fz="sm">
          {todos.length} todo{todos.length !== 1 && "s"} in {lists.length + 1}{" "}
          list{lists.length + 1 !== 1 && "s"}
        </Text>
      </Center>
      <NetworkOverlay />
    </Footer>
  );
};
