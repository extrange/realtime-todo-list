import { Aside, Transition, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CSSProperties } from "react";
import { OnlineUsers } from "./OnlineUsers";

type InputProps = {
  asideOpen?: boolean;
};

/**
 * Shows user online/active status, and recently viewed todos.
 */
export const AppAside = ({ asideOpen }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const render = (styles?: CSSProperties) => (
    <Aside style={styles} p="md" width={{ sm: 200, lg: 300 }}>
      <OnlineUsers />
    </Aside>
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!asideOpen} transition="slide-left">
      {render}
    </Transition>
  );
};
