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
import { CSSProperties, useCallback, useState } from "react";
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

export const AppNavbar = ({ navOpen, closeNav }: InputProps) => {
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
          <ListView closeNav={closeNav} />
        </ScrollArea>
        <Flex direction={"column"} justify={"flex-end"} mt={10}>
          <MarkAllRead closeNav={closeNav} />
          <Button
            leftIcon={<IconLogout />}
            onClick={() => setChangeRoom(true)}
            variant="outline"
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
};
