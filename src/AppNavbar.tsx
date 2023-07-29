import {
  Button,
  Flex,
  Modal,
  Navbar,
  ScrollArea,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import React, { CSSProperties, Profiler, useCallback, useState } from "react";
import { EditRoom } from "./EditRoom";
import { EditUser } from "./EditUser";
import { ListView } from "./ListView";
import { MarkAllRead } from "./MarkAllRead";
import { SavedRoomsView } from "./SavedRoomsView";
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
      <Navbar style={styles} p="xs" width={{ sm: 200, lg: 300 }}>
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
        <ScrollArea pt={5} offsetScrollbars>
          <Profiler
            id={"ListView"}
            onRender={(id, phase, duration) =>
              duration > 30 && console.info(id, phase, duration)
            }
          >
            <ListView closeNav={closeNav} />
          </Profiler>
        </ScrollArea>
        <Flex direction={"column"} justify={"flex-end"} mt={10}>
          <MarkAllRead closeNav={closeNav} />
          <Button
            leftIcon={<IconLogout />}
            onClick={() => setChangeRoom(true)}
            variant="filled"
            mt={10}
          >
            Change Room
          </Button>
        </Flex>
      </Navbar>
    ),
    [changeRoom, closeNav, setCurrentRoomId]
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!navOpen} transition="slide-right">
      {render}
    </Transition>
  );
});
