import { AppShell, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";
import { TodoView } from "./TodoView";
import "./editor.css";

export type User = {
  name?: string;
  color?: string;
};

export const App = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);

  const theme = useMantineTheme();

  return (
    <AppShell
      padding="md"
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<AppNavbar navOpen={navOpen} />}
      header={
        <AppHeader
          navOpen={navOpen}
          setNavOpen={setNavOpen}
          asideOpen={asideOpen}
          setAsideOpen={setAsideOpen}
        />
      }
      footer={<AppFooter />}
      aside={<AppAside asideOpen={asideOpen} />}
    >
      <TodoView />
    </AppShell>
  );
};
