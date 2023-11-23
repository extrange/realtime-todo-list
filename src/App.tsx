import { AppShell, ScrollArea } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  Profiler,
  ProfilerOnRenderCallback,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import classes from "./App.module.css";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader/AppHeader";
import { AppNavbar } from "./AppNavbar";
import { EditTodoWrapper } from "./EditTodoWrapper/EditTodoWrapper";
import { TodoView } from "./TodoView/TodoView";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 30;

export const App = () => {
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

  const logRender: ProfilerOnRenderCallback = useCallback(
    (id, phase, duration) => duration > 10 && console.info(id, phase, duration),
    []
  );

  return (
    <AppShell
      navbar={{
        width: { sm: 200, lg: 300 },
        breakpoint: "sm",
      }}
      aside={{
        width: { sm: 200, lg: 300 },
        breakpoint: "sm",
      }}
      header={{ height: HEADER_HEIGHT }}
      footer={{ height: FOOTER_HEIGHT }}
    >
      <AppHeader
        navOpen={navOpen}
        setNavOpen={_setNavOpen}
        asideOpen={asideOpen}
        setAsideOpen={_setAsideOpen}
      />
      <AppAside asideOpen={asideOpen} />
      <AppNavbar navOpen={navOpen} closeNav={closeNav} />
      <Profiler id={"AppFooter"} onRender={logRender}>
        <AppFooter />
      </Profiler>
      <AppShell.Main className={classes.main}>
        <EditTodoWrapper />
        <ScrollArea h={height - HEADER_HEIGHT - FOOTER_HEIGHT}>
          <Profiler
            id={"TodoView"}
            onRender={(id, phase, duration) =>
              duration > 15 && console.info(id, phase, duration)
            }
          >
            <TodoView />
          </Profiler>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
};
