import { Aside } from "@mantine/core";
import { OnlineUsers } from "./OnlineUsers";

type InputProps = {
  className?: string;
};

/**
 * Shows user online/active status, and recently viewed todos.
 */
export const AppAside = (props: InputProps) => {
  return (
    <Aside {...props} p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      <OnlineUsers />
    </Aside>
  );
};
