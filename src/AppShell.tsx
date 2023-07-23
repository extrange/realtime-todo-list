import {
  AppShell as AppShellMantine,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { SetStateAction, useCallback, useState } from "react";
import { App } from "./App";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";

export type User = {
  name?: string;
  color?: string;
};

export const AppShell = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);
  const { height } = useViewportSize();

  /* For AppHeader: Don't allow both the NavBar and Aside to be open */
  const _setNavOpen = useCallback((open: SetStateAction<boolean>) => {
    setNavOpen(open);
    open && setAsideOpen(false);
  }, []);

  const _setAsideOpen = useCallback((open: SetStateAction<boolean>) => {
    setAsideOpen(open);
    open && setNavOpen(false);
  }, []);

  const closeNav = useCallback(() => setNavOpen(false), [setNavOpen]);

  const theme = useMantineTheme();

  return (
    <AppShellMantine
      padding={0}
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          display: "flex",
          flexDirection: "column",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<AppNavbar navOpen={navOpen} closeNav={closeNav} />}
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
      <ScrollArea
        h={`calc(${height}px - var(--mantine-footer-height) - var(--mantine-header-height))`}
        offsetScrollbars
      >
        <App/>
      </ScrollArea>
    </AppShellMantine>
  );
};
