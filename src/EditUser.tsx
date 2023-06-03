import {
    Button,
    Center,
    ColorPicker,
    Container,
    Modal,
    Text,
    TextInput
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import React, { useState } from "react";
import { colors } from "./constants";
import "./editor.css";
import { useUserData } from "./useUserData";

export const EditUser = () => {
  const [edit, setEdit] = useState<boolean>(false);
  const [userData, setUserData] = useUserData();

  /* useForm doesn't work here, because it caches values from the
  first render. I would have to find a way to update the form state
  on initial load. */

  const onNameInput: React.FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value: name },
  }) => setUserData((u) => ({ ...u, user: { ...u.user, name } }));

  const onColorInput = (color: string) =>
    color && setUserData((u) => ({ ...u, user: { ...u.user, color } }));

  return (
    <>
      <Modal opened={edit} onClose={() => setEdit(false)} returnFocus={false}>
        <Container>
          <Center sx={{ paddingBottom: "10px" }}>
            <Text
              className={"collaboration-cursor__label"}
              style={{
                position: "inherit",
                fontSize: "initial",
                display: "inline-block",
              }}
              bg={userData.user.color}
              ta={"center"}
            >
              {userData.user.name}
            </Text>
          </Center>
          <TextInput
            value={userData.user.name}
            data-autofocus
            onInput={onNameInput}
            error={!userData.user.name && "You must enter a name"}
          />
          <ColorPicker
            format={"hex"}
            swatches={colors}
            withPicker={false}
            fullWidth
            onChange={onColorInput}
            value={userData.user.color}
          />
        </Container>
      </Modal>

      {/* Content starts here */}
      <Button
        rightIcon={<IconPencil color={"white"} />}
        variant={"subtle"}
        onClick={() => setEdit(true)}
      >
        <Text color={userData.user.color}>{userData.user.name}</Text>
      </Button>
      <Text>Lists will appear here</Text>
    </>
  );
};
