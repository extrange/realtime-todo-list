import { Center, Footer, Text } from "@mantine/core";
import React from "react";
import { NetworkOverlay } from "./NetworkOverlay";
import { useAppStore } from "./appStore/appStore";
import { useRerenderDaily } from "./useRerenderDaily";
import { Todo } from "./useSyncedStore";

const getDueString = (dueTodos: Todo[]) => {
  const numDueTodos = dueTodos.length;
  if (!numDueTodos) return "";

  return `${dueTodos.length} todo${numDueTodos !== 1 ? "s" : ""} due`;
};

export const AppFooter = React.memo(() => {
  // will shallow compare improve rendering time?
  const dueTodos = useAppStore((state) => state.dueTodos);

  useRerenderDaily();

  return (
    <Footer height={30}>
      <Center h="100%">
        <Text c="dimmed" fz="sm">
          {getDueString(dueTodos)}
        </Text>
      </Center>
      <NetworkOverlay />
    </Footer>
  );
});

AppFooter.displayName = "AppFooter";
