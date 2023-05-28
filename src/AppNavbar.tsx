import {
    Button,
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
          <Text ta={"center"} c={userForm.values.color}>
            {userForm.values.name}
          </Text>
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
