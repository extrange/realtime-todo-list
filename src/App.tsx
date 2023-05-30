import {
  AppShell,
  Aside,
  Footer,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";
import { TodoView } from "./TodoView";
import "./editor.css";
import { ReloadPrompt } from "./reloadPrompt";

export type User = {
  name: string;
  color: string;
};

export const App = () => {
  const [navOpen, setNavOpen] = useState<boolean>(false);

  const theme = useMantineTheme();

  return (
    <>
      <ReloadPrompt />

      {/* Main content starts here */}
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
        header={<AppHeader navOpen={navOpen} setNavOpen={setNavOpen} />}
        footer={
          <Footer height={20}>
            Show user online status here, maybe even network status
          </Footer>
        }
        aside={
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
              <Text>Application sidebar</Text>
            </Aside>
          </MediaQuery>
        }
      >
        <TodoView />
      </AppShell>
    </>
  );
};
