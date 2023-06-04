import { Button, Center, Image, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import React, { FormEvent, useCallback, useContext } from "react";
import { TypeAnimation } from "react-type-animation";
import { v4 as uuidv4 } from "uuid";
import { ProviderContext } from "./ProviderContext";
import { RoomContext } from "./RoomContext";
import { StoreContext } from "./StoreContext";
import bugcat from "./assets/capoo-bugcat.gif";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import { validateUuid } from "./util";

/** This sits before the app, and will activate if either room or user
 * is not set, and prompt the user.
 *
 * Attempts to load the user and roomId from localStorage. */
export const Login = ({ children }: React.PropsWithChildren) => {
  const store = useContext(StoreContext);
  const provider = useContext(ProviderContext);
  const roomContext = useContext(RoomContext);
  const [, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });

  const form = useForm({
    initialValues: {
      roomId: "",
    },
    validate: {
      roomId: (v) => {
        if (!v) return "Room ID cannot be empty";
        return validateUuid(v) ? null : "Invalid room ID";
      },
    },
    validateInputOnBlur: true,
  });

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      form.validate();
      form.isValid() &&
        form.onSubmit(({ roomId }) => {
          roomContext?.setRoomId(roomId);

          /* Save to localStorage */
          setCurrentRoomId(roomId);
          form.reset();
        })();
    },
    [form, roomContext, setCurrentRoomId]
  );

  /* Create a new room and save to localStorage */
  const createRoom = useCallback(() => {
    const generatedRoomId = uuidv4();
    roomContext?.setRoomId(generatedRoomId);
    setCurrentRoomId(generatedRoomId);
  }, [roomContext, setCurrentRoomId]);

  return (
    roomContext?.roomId ? (
      store && provider ? (
        children
      ) : (
        <div>Loading</div>
      )
    ) : (
      <Modal opened onClose={() => void 0} withCloseButton={false}>
        <h1 style={{ textAlign: "center" }}>Todo</h1>
        <TypeAnimation
          style={{ fontSize: "0.8rem" }}
          sequence={[
            "Remember what to buy",
            1000,
            "Remember places you want to visit",
            1000,
            "Remember movies you like",
            1000,
            "Remember food you want to try",
            1000,
            "Remember what someone said",
            1000,
            "Remember interesting things",
            1000,
          ]}
          repeat={Infinity}
        />
        <Center>
          <Image height={150} width={200} fit="contain" src={bugcat} />
        </Center>

        <form onSubmit={onSubmit}>
          <TextInput
            {...form.getInputProps("roomId")}
            placeholder="Enter a Room ID"
            my={10}
          />
          <Stack>
            <Button type="submit">Join</Button>
            <Button onClick={createRoom}>Create a New Room</Button>
          </Stack>
        </form>
      </Modal>
    )
  ) /* Without this TS gives errors on main.tsx */ as JSX.Element;
};
