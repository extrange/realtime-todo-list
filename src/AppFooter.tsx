import { Center, Footer, Text } from "@mantine/core";
import React from "react";
import { NetworkOverlay } from "./NetworkOverlay";
import { useAppStore } from "./appStore/appStore";

const getTodosHiddenString = (numHiddenTodos: number) => {
  if (!numHiddenTodos) return "";

  return `${numHiddenTodos} todo${numHiddenTodos !== 1 ? "s" : ""} hidden`;
};

export const AppFooter = React.memo(() => {
  // will shallow compare improve rendering time?
  const numTodosHidden = useAppStore((state) => state.numTodosHidden);

  return (
    <Footer height={30}>
      <Center h="100%">
        <Text c="dimmed" fz="sm">
          {getTodosHiddenString(numTodosHidden)}
        </Text>
      </Center>
      <NetworkOverlay />
    </Footer>
  );
});

AppFooter.displayName = "AppFooter";
