import {
  ActionIcon,
  AppShellNavbar,
  Button,
  Flex,
  Modal,
  ScrollArea,
  Tooltip,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import React, { CSSProperties, Profiler, useCallback, useState } from "react";
import { EditRoom } from "./EditRoom";
import { EditUser } from "./EditUser";
import { Import } from "./Import/Import";
import { ListView } from "./ListView";
import { MarkAllRead } from "./MarkAllRead";
import { SavedRoomsView } from "./SavedRoomsView";
import { Settings } from "./Settings/Settings";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import "./editor.css";

type InputProps = {
  navOpen?: boolean;
  closeNav: () => void;
};

export const AppNavbar = React.memo(({ navOpen, closeNav }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const [changeRoom, setChangeRoom] = useState(false);
  const [, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  const render = useCallback(
    (styles?: CSSProperties) => (
      <AppShellNavbar style={styles} p="xs">
        <Modal
          title="Change Room"
          opened={changeRoom}
          onClose={() => setChangeRoom(false)}
        >
          <SavedRoomsView onCloseHandler={() => setChangeRoom(false)} />
          {/* A blank room string is used because...? */}
          <Button onClick={() => setCurrentRoomId("")} mt={"md"}>
            Leave Room
          </Button>
        </Modal>
        <EditRoom />
        <EditUser />
        <ScrollArea pt={5}>
          <Profiler
            id={"ListView"}
            onRender={(id, phase, duration) =>
              duration > 30 && console.info(id, phase, duration)
            }
          >
            <ListView closeNav={closeNav} />
          </Profiler>
        </ScrollArea>
        <Flex align="center" justify={"space-between"} mt={10}>
          <Tooltip label="Change room">
            <ActionIcon
              variant="light"
              onClick={() => setChangeRoom(true)}
              mr={10}
              size="lg"
            >
              <IconLogout />
            </ActionIcon>
          </Tooltip>
          <MarkAllRead closeNav={closeNav} />
          <Import closeNav={closeNav} />
          <Settings closeNav={closeNav} />
        </Flex>
      </AppShellNavbar>
    ),
    [changeRoom, closeNav, setCurrentRoomId]
  );

  return (
    <Transition
      mounted={isDesktop || !!navOpen}
      transition="slide-right"
      // So that Settings can still persist when NavBar is closed
      keepMounted
    >
      {render}
    </Transition>
  );
});

AppNavbar.displayName = "AppNavbar";
