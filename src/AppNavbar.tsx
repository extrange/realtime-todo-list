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
import { CSSProperties, useState } from "react";
import { EditUser } from "./EditUser";
import { MarkAllRead } from "./MarkAllRead";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import "./editor.css";

type InputProps = {
  navOpen?: boolean;
};

export const AppNavbar = ({ navOpen }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const [confirmChange, setConfirmChange] = useState(false);
  const [, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  const render = (styles?: CSSProperties) => (
    <Navbar style={styles} p="md" width={{ sm: 200, lg: 300 }}>
      <Modal
        title="Leave the current room?"
        opened={confirmChange}
        onClose={() => setConfirmChange(false)}
      >
        <Button onClick={() => setCurrentRoomId("")}>Yes</Button>
      </Modal>
      <EditUser />
      <Flex direction={"column"} justify={"flex-end"} sx={{ height: "100%" }}>
        <MarkAllRead />
        <Button
          leftIcon={<IconLogout />}
          onClick={() => setConfirmChange(true)}
          variant="outline"
          my={10}
        >
          Change Room
        </Button>
      </Flex>
    </Navbar>
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!navOpen} transition="slide-right">
      {render}
    </Transition>
  );
};
