import styled from "@emotion/styled";
import {
  ActionIcon,
  Flex,
  Menu,
  Overlay,
  Portal,
  Text,
  TextProps,
  createPolymorphicComponent,
  useMantineTheme,
} from "@mantine/core";
import { IconDotsVertical, IconTargetArrow } from "@tabler/icons-react";
import React, { useMemo, useState, useTransition } from "react";
import { selectTodos, useSyncedStore } from "./useSyncedStore";

type CommonProps = {
  selected?: boolean;
  selectList: (id?: string) => void;
};

type OptionalProps =
  | {
      editable: true;
      focus?: never;
      listId: string;
      listName?: string;
      deleteList: (id: string) => void;
      renameList: (id: string) => void;
    }
  | {
      /**Uncategorized */
      editable?: false;
      focus?: boolean;
      listId?: never;
      listName?: never;
      deleteList?: never;
      renameList?: never;
    };

type StyledProps = {
  /**Whether this is the currently selected list */
  selected?: boolean;
};

/**Div containing the StyledListContent */
const StyledFlex = styled(Flex)<StyledProps>`
  ${({ selected }) => selected && "background-color: rgb(57, 57, 63)"};

  :hover {
    ${({ selected }) => !selected && "background-color: rgb(44, 46, 51)"}
  }
`;

const _StyledListContent = styled(Text)`
  width: 100%;
  padding: 10px 0 10px 0px;
  user-select: none;
  cursor: default;
  overflow-wrap: anywhere;
`;

const StyledListContent = createPolymorphicComponent<"div", TextProps>(
  _StyledListContent
);

export const ListItem = React.memo(
  ({
    listId,
    listName,
    selected,
    deleteList,
    renameList,
    selectList,
    editable,
    focus,
  }: CommonProps & OptionalProps) => {
    const [, startTransition] = useTransition();
    const theme = useMantineTheme();
    const [menuOpened, setMenuOpened] = useState(false);

    /* TODO This is a band aid. Ideally, we only want to listen to whether:
    - added/deleted todos
    - whether completed/focus/listId have changed*/
    const todos = useSyncedStore(selectTodos, 5000);

    const uncompletedTodos = useMemo(
      () =>
        todos.filter(
          (t) => !t.completed && (focus ? t.focus : t.listId === listId)
        ).length,
      [focus, listId, todos]
    );

    const menu = useMemo(
      () =>
        editable ? (
          <Menu opened={menuOpened} onChange={setMenuOpened} withinPortal>
            <Portal>{menuOpened && <Overlay opacity={0} />}</Portal>
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical color={theme.colors.gray[6]} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => listId && deleteList(listId)}>
                Delete
              </Menu.Item>
              <Menu.Item onClick={() => listId && renameList(listId)}>
                Rename
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : null,
      [deleteList, editable, listId, menuOpened, renameList, theme.colors.gray]
    );

    const render = useMemo(
      () => (
        <StyledFlex selected={selected} align={"center"} pl={5}>
          {focus && <IconTargetArrow style={{ marginRight: 5 }} />}
          <StyledListContent
            /*Allow switching slow-rendering lists */
            onClick={() => startTransition(() => selectList(listId))}
            fw={selected ? 700 : "normal"}
          >
            {focus
              ? `Focus (${uncompletedTodos})`
              : !listName
              ? `Uncategorized (${uncompletedTodos})`
              : `${listName} (${uncompletedTodos})`}
          </StyledListContent>
          {menu}
        </StyledFlex>
      ),
      [focus, listId, listName, menu, selectList, selected, uncompletedTodos]
    );

    return render;
  }
);
