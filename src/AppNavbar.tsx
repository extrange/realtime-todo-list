import styled from "@emotion/styled";
import {
  ActionIcon,
  Button,
  Flex,
  Modal,
  Navbar,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { IconLogout, IconTrash } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import React, {
  CSSProperties,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { EditUser } from "./EditUser";
import { MarkAllRead } from "./MarkAllRead";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import "./editor.css";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { selectLists, selectTodos, useSyncedStore } from "./useSyncedStore";
import { getMaxSortOrder } from "./util";

const StyledList = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 10px;
`;

type InputProps = {
  navOpen?: boolean;
  setNavOpen: React.Dispatch<SetStateAction<boolean>>;
};

export const AppNavbar = ({ navOpen, setNavOpen }: InputProps) => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const [confirmLeaveRoom, setConfirmLeaveRoom] = useState(false);
  const [, setCurrentRoomId] = useLocalStorage({
    key: CURRENT_ROOM_LOCALSTORAGE_KEY,
  });
  const store = useStore();
  const lists = useSyncedStore(selectLists);
  const [currentList, setCurrentList] = useCurrentList();

  const createList = useCallback(() => {
    const name = prompt("Enter list name:");
    if (!name) return;
    const sortOrder = generateKeyBetween(
      getMaxSortOrder(store.todos),
      undefined
    );
    const newListId = uuidv4();
    selectLists(store).push({ id: newListId, name: name, sortOrder });
    setCurrentList(newListId);
  }, [setCurrentList, store]);

  const deleteList = useCallback(
    (listId: string) => {
      /* First delete all the tasks in the list */
      const storeTodos = selectTodos(store);
      storeTodos
        .filter((t) => t.listId === listId)
        .forEach((t) =>
          storeTodos.splice(store.todos.findIndex((t2) => t2.id === t.id))
        ),
        1;

      /* Then delete the list */
      const storeLists = selectLists(store);
      storeLists.splice(storeLists.findIndex((l) => l.id === listId, 1));
    },
    [store]
  );

  const selectList = useCallback(
    (listId?: string) => {
      setCurrentList(listId);
      setNavOpen(false);
    },
    [setCurrentList, setNavOpen]
  );

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
        <StyledList
          onClick={() => selectList(undefined)}
          style={{ background: currentList ? "initial" : "blue" }}
        >
          Uncategorized
        </StyledList>
        {lists.map((list) => (
          <StyledList
            onClick={() => selectList(list.id)}
            style={{ background: list.id === currentList ? "blue" : "initial" }}
          >
            {list.name}
            <ActionIcon onClick={() => deleteList(list.id)}>
              <IconTrash />
            </ActionIcon>
          </StyledList>
        ))}
        <Button onClick={createList}>Create List</Button>
        <Flex direction={"column"} justify={"flex-end"} sx={{ height: "100%" }}>
          <MarkAllRead setNavOpen={setNavOpen} />
          <Button
            leftIcon={<IconLogout />}
            onClick={() => setConfirmLeaveRoom(true)}
            variant="outline"
            my={10}
          >
            Change Room
          </Button>
        </Flex>
      </Navbar>
    ),
    [confirmLeaveRoom, createList, currentList, deleteList, lists, selectList, setCurrentRoomId, setNavOpen]
  );

  return isDesktop ? (
    render()
  ) : (
    <Transition mounted={isDesktop || !!navOpen} transition="slide-right">
      {render}
    </Transition>
  );
};
