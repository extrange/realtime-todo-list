import styled from "@emotion/styled";
import {
  ActionIcon,
  Button,
  Flex,
  Menu,
  Text,
  TextProps,
  createPolymorphicComponent,
  useMantineTheme,
} from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { generateKeyBetween } from "fractional-indexing";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { selectLists, selectTodos, useSyncedStore } from "./useSyncedStore";
import { getMaxSortOrder } from "./util";

type CurrentListNameChange = "currentListNameChange";

declare global {
  interface Document {
    addEventListener<K extends CurrentListNameChange>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
    removeEventListener<K extends CurrentListNameChange>(
      type: K,
      listener: (this: Document, ev: Event) => void
    ): void;
  }
}

type InputProps = {
  closeNav: () => void;
};

type StyledProps = {
  /**Whether this is the currently selected list */
  selected?: boolean;
};

/**Div containing the StyledListContent */
const StyledFlex = styled(Flex)<StyledProps>`
  ${({ selected }) => selected && "background-color: rgb(57, 57, 63)"};

  :hover {
    background-color: rgb(44, 46, 51);
  }
`;

const _StyledListContent = styled(Text)`
  width: 100%;
  padding: 10px 0 10px 0px;
  user-select: none;
  cursor: default;
`;

const StyledListContent = createPolymorphicComponent<"div", TextProps>(
  _StyledListContent
);

export const ListView = ({ closeNav }: InputProps) => {
  const store = useStore();
  const lists = useSyncedStore(selectLists);
  const [currentList, setCurrentList] = useCurrentList();
  const theme = useMantineTheme();

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
    closeNav();
  }, [closeNav, setCurrentList, store]);

  /* Sort lists alphabetically */
  const sortedLists = useMemo(
    () => lists.slice().sort((a,b) => a.name.localeCompare(b.name)),
    [lists]
  );

  /* Deleting a list deletes all tasks the list, including completed tasks */
  const deleteList = useCallback(
    (listId: string) => {
      const name = lists.find((l) => l.id === listId)?.name;

      if (!confirm(`Delete '${name}'? This will delete all todos as well.`))
        return;

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
    [lists, store]
  );

  const renameList = useCallback(
    (listId: string) => {
      const name = prompt("Enter a new name:");
      if (!name) return;
      const list = store.lists.find((l) => l.id === listId);
      list && (list.name = name);
      document.dispatchEvent(new Event("currentListNameChange"));
    },
    [store]
  );

  const selectList = useCallback(
    (listId?: string) => {
      setCurrentList(listId);
      closeNav();
    },
    [closeNav, setCurrentList]
  );

  return (
    <Flex direction="column" h="100%">
      <Button my={10} onClick={createList}>
        Create List
      </Button>
      <StyledFlex
        pl={5}
        onClick={() => selectList(undefined)}
        selected={!currentList}
      >
        <StyledListContent fw={!currentList ? 700 : "normal"} italic>
          Uncategorized
        </StyledListContent>
      </StyledFlex>
      {sortedLists.map((list) => (
        <StyledFlex selected={list.id === currentList} align={"center"} pl={5}>
          <StyledListContent
            onClick={() => selectList(list.id)}
            fw={list.id === currentList ? 700 : "normal"}
          >
            {list.name}
          </StyledListContent>
          <Menu>
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical color={theme.colors.gray[6]} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => deleteList(list.id)}>Delete</Menu.Item>
              <Menu.Item onClick={() => renameList(list.id)}>Rename</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </StyledFlex>
      ))}
    </Flex>
  );
};
