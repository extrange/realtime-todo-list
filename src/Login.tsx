import {
  Button,
  Center,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import React, { FormEvent, useCallback, useContext } from "react";
import { TypeAnimation } from "react-type-animation";
import { v4 as uuidv4 } from "uuid";
import { ProviderContext } from "./ProviderContext";
import { RoomContext } from "./RoomContext";
import { SavedRoomsView } from "./SavedRoomsView";
import { StoreContext } from "./StoreContext";
import bugcat from "./assets/capoo-bugcat.gif";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import { validateUuid } from "./util";

/**Object with keys:value UUID:roomName */
export type SavedRooms = Record<string, string | null>;

/** This sits before the app, and will activate if either room or user
 * is not set, and prompt the user.
 *
 * Also shows the user's saved rooms (deletable).
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
        <h1 style={{ textAlign: "center", marginBottom: 10 }}>Todo</h1>
        <div style={{ height: "2rem" }}>
          <TypeAnimation
            style={{ fontSize: "0.8rem" }}
            sequence={[
              "Stay organized and get things done!",
              "Your to-do list, your way!",
              "Your productivity assistant!",
              "Plan your day and conquer it!",
              "Never forget a task again!",
              "Achieve your goals, one task at a time!",
              "Get things done, effortlessly!",
              "Create your to-do list, and let us handle the rest!",
              "Make every day count with our app!",
              "The easiest way to stay on top of your tasks!",
              "Get more done in less time with our app!",
              "Your to-do list, reimagined!",
              "Take control of your tasks and stay productive!",
              "Work smarter, not harder!",
              "Organize your life and achieve your dreams!",
              "Your personal assistant for productivity!",
              "Simplify your life, one task at a time!",
              "Boost your productivity with our app!",
              "Don't just make plans, make progress!",
              "Your ultimate productivity tool!",
            ].flatMap((e) => [e, 700])}
            speed={70}
            omitDeletionAnimation
            repeat={Infinity}
          />
        </div>
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
        <Text ta="center" c="dimmed" py={10}>Recent Rooms</Text>
        <SavedRoomsView />
      </Modal>
    )
  ) /* Without this TS gives errors on main.tsx */ as JSX.Element;
};
