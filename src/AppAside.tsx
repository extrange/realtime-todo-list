import { Aside, ScrollArea, Transition, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { CSSProperties, useCallback } from "react";
import { OnlineUsers } from "./OnlineUsers";

type InputProps = {
  asideOpen?: boolean;
};

/**
 * Shows user online/active status, and recently viewed todos.
 */
export const AppAside = React.memo(({ asideOpen }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const getContent = useCallback(
    (styles?: CSSProperties) => (
      <Aside style={styles} p="none" width={{ sm: 200, lg: 300 }}>
        <ScrollArea>
          <OnlineUsers />
        </ScrollArea>
      </Aside>
    ),
    []
  );

  return (
    <Transition
      keepMounted
      mounted={isDesktop || !!asideOpen}
      transition="slide-left"
    >
      {getContent}
    </Transition>
  );
});

AppAside.displayName = "AppAside";
