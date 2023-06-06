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

  const jsx = (styles?: CSSProperties) => (
    <Aside style={styles} p="md" width={{ sm: 200, lg: 300 }} zIndex={200}>
      {/* Show as avatar groups, with text 'xx users online', on click show
      dialog with user status */}
      <OnlineUsers />
    </Aside>
  );

  return isDesktop ? (
    jsx()
  ) : (
    <Transition mounted={isDesktop || !!asideOpen} transition="slide-left">
      {jsx}
    </Transition>
  );
};
