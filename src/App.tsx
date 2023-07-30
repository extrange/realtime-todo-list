import {
  AppShell,
  AppShellStylesNames,
  CSSObject,
  ScrollArea,
  Styles,
  useMantineTheme,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  Profiler,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader/AppHeader";
import { AppNavbar } from "./AppNavbar";
import { EditTodoWrapper } from "./EditTodoWrapper";
import { TodoView } from "./TodoView";

export type User = {
  name?: string;
  color?: string;
};

export const App = () => {
  const theme = useMantineTheme();

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

  /* Memoized components */
  const appShellStyles = useMemo(
    (): Styles<AppShellStylesNames, CSSObject> => ({
      main: {
        background:
          theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
        display: "flex",
        flexDirection: "column",
      },
    }),
    [theme.colorScheme, theme.colors.dark, theme.colors.gray]
  );

  const navbar = useMemo(
    () => <AppNavbar navOpen={navOpen} closeNav={closeNav} />,
    [closeNav, navOpen]
  );

  const footer = useMemo(
    () => (
      <Profiler
        id={"AppFooter"}
        onRender={(id, phase, duration) =>
          duration > 10 && console.info(id, phase, duration)
        }
      >
        <AppFooter />
      </Profiler>
    ),
    []
  );

  const aside = useMemo(() => <AppAside asideOpen={asideOpen} />, [asideOpen]);

  const content = useMemo(
    () => (
      <>
        <EditTodoWrapper />
        <ScrollArea
          h={`calc(${height}px - var(--mantine-footer-height) - var(--mantine-header-height))`}
          offsetScrollbars
        >
          <Profiler
            id={"TodoView"}
            onRender={(id, phase, duration) =>
              duration > 15 && console.info(id, phase, duration)
            }
          >
            <TodoView />
          </Profiler>
        </ScrollArea>
      </>
    ),
    [height]
  );

  return (
    <AppShell
      padding={0}
      styles={appShellStyles}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      header={
        <AppHeader
          navOpen={navOpen}
          setNavOpen={_setNavOpen}
          asideOpen={asideOpen}
          setAsideOpen={_setAsideOpen}
        />
      }
      navbar={navbar}
      aside={aside}
      footer={footer}
    >
      {content}
    </AppShell>
  );
};
