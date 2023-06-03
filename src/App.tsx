import { AppShell, useMantineTheme } from "@mantine/core";
import { SetStateAction, useCallback, useState } from "react";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";
import { TodoView } from "./TodoView";

export type User = {
  name?: string;
  color?: string;
};

export const App = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);

  /* Don't allow both the NavBar and Aside to be open */
  const _setNavOpen = useCallback((open: SetStateAction<boolean>) => {
    setNavOpen(open);
    open && setAsideOpen(false);
  }, []);

  const _setAsideOpen = useCallback((open: SetStateAction<boolean>) => {
    setAsideOpen(open);
    open && setNavOpen(false);
  }, []);

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
          setNavOpen={_setNavOpen}
          asideOpen={asideOpen}
          setAsideOpen={_setAsideOpen}
        />
      }
      footer={<AppFooter />}
      aside={<AppAside asideOpen={asideOpen} />}
    >
      <TodoView />
    </AppShell>
  );
};
