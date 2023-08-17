import styled from "@emotion/styled";
import {
  ActionIcon,
  Avatar,
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
import React, { useCallback, useMemo, useState, useTransition } from "react";
import { List } from "./useSyncedStore";

type CommonProps = {
  selected?: boolean;
  selectList: (id?: string) => void;
  uncompletedTodosCount: number;
};

type OptionalProps =
  | {
      /** Editable lists*/
      editable: true;
      focus?: never;
      list: List;
      deleteList: (id: string) => void;
      renameList: (id: string) => void;
    }
  | {
      /**Uncategorized and Focus*/
      editable?: false;
      focus?: boolean;
      list?: never;
      deleteList?: never;
      renameList?: never;
    };

type StyledProps = {
  /**Whether this is the currently selected list */
  selected?: boolean;
};

/**Div containing the StyledListContent */
const StyledFlex = styled(Flex)<StyledProps>`
  ${({ selected}) => selected && "background-color: rgb(57, 57, 63)"};

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
    list,
    uncompletedTodosCount,
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
              <Menu.Item onClick={() => deleteList(list.id)}>Delete</Menu.Item>
              <Menu.Item onClick={() => renameList(list.id)}>Rename</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : null,
      [
        deleteList,
        editable,
        list?.id,
        menuOpened,
        renameList,
        theme.colors.gray,
      ]
    );

    const onClick = useCallback(
      /*Allow switching slow-rendering lists */
      () => startTransition(() => selectList(list?.id)),
      [list?.id, selectList]
    );

    return (
      <StyledFlex selected={selected} align={"center"} pl={5}>
        {focus && <IconTargetArrow style={{ marginRight: 5 }} />}
        <StyledListContent onClick={onClick} fw={selected ? 700 : "normal"}>
          <Flex align={"center"}>
            {focus
              ? `Focus/Due`
              : !list?.name
              ? `Uncategorized`
              : `${list.name} `}{" "}
            {uncompletedTodosCount ? (
              <Avatar color="primary" size="sm" mx={10} variant="light">
                {uncompletedTodosCount}
              </Avatar>
            ) : null}
          </Flex>
        </StyledListContent>
        {menu}
      </StyledFlex>
    );
  }
);
