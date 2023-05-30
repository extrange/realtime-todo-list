import {
  Button,
  Center,
  ColorPicker,
  Container,
  Modal,
  Navbar,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { colors } from "./constants";
import "./editor.css";
import { generateUser } from "./util";

type InputProps = {
  navOpen?: boolean;
};
export const AppNavbar = ({ navOpen }: InputProps) => {
  const [user, setUser] = useLocalStorage({
    key: "user",
    defaultValue: generateUser(),
  });
  const [edit, setEdit] = useState<boolean>(false);

  const userForm = useForm({
    initialValues: user,
  });

  const onClose = () => {
    setEdit(false);
    setUser(userForm.values);
  };

  return (
    <>
      <Modal opened={edit} onClose={onClose} returnFocus={false}>
        <Container>
          <Center sx={{ paddingBottom: "10px" }}>
            <Text
              className={"collaboration-cursor__label"}
              style={{
                position: "inherit",
                fontSize: "initial",
                display: "inline-block",
              }}
              bg={userForm.values.color}
              ta={"center"}
            >
              {userForm.values.name}
            </Text>
          </Center>
          <TextInput data-autofocus {...userForm.getInputProps("name")} />
          <ColorPicker
            format={"hex"}
            swatches={colors}
            withPicker={false}
            fullWidth
            {...userForm.getInputProps("color")}
          />
        </Container>
      </Modal>
      <Navbar
        p="md"
        hiddenBreakpoint="sm"
        hidden={!navOpen}
        width={{ sm: 200, lg: 300 }}
      >
        <Button
          rightIcon={<IconPencil color={"white"} />}
          variant={"subtle"}
          onClick={() => setEdit(true)}
        >
          <Text color={user.color}>{user.name}</Text>
        </Button>
      </Navbar>
    </>
  );
};
