import {
  Button,
  Flex,
  Modal,
  Navbar,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { CSSProperties, useCallback, useState } from "react";
import { EditUser } from "./EditUser";
import { ListView } from "./ListView";
import { MarkAllRead } from "./MarkAllRead";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import "./editor.css";

type InputProps = {
  navOpen?: boolean;
  closeNav: () => void;
};

export const AppNavbar = ({ navOpen, closeNav }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const [confirmLeaveRoom, setConfirmLeaveRoom] = useState(false);
  const [, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  const render = useCallback(
    (styles?: CSSProperties) => (
      <Navbar style={styles} p="md" width={{ sm: 200, lg: 300 }}>
        <Modal
          title="Leave the current room?"
          opened={confirmLeaveRoom}
          onClose={() => setConfirmLeaveRoom(false)}
        >
          <Button onClick={() => setCurrentRoomId("")}>Yes</Button>
        </Modal>
        <EditUser />
        <ListView closeNav={closeNav} />
        <Flex direction={"column"} justify={"flex-end"} >
          <MarkAllRead closeNav={closeNav} />
          <Button
            leftIcon={<IconLogout />}
            onClick={() => setConfirmLeaveRoom(true)}
            variant="outline"
            mt={10}
          >
            Change Room
          </Button>
        </Flex>
      </Navbar>
    ),
    [confirmLeaveRoom, closeNav, setCurrentRoomId]
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!navOpen} transition="slide-right">
      {render}
    </Transition>
  );
};
