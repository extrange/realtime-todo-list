import { Flex, Navbar, Transition, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CSSProperties } from "react";
import { EditUser } from "./EditUser";
import { MarkAllRead } from "./MarkAllRead";
import "./editor.css";

type InputProps = {
  navOpen?: boolean;
};

export const AppNavbar = ({ navOpen }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const render = (styles?: CSSProperties) => (
    <Navbar style={styles} p="md" width={{ sm: 200, lg: 300 }}>
      <EditUser />
      <Flex direction={"column"} justify={"flex-end"} sx={{ height: "100%" }}>
        <MarkAllRead />
      </Flex>
    </Navbar>
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!navOpen} transition="slide-right">
      {render}
    </Transition>
  );
};
