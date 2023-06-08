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
  useMantineTheme
} from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { useMemo, useState } from "react";

type CommonProps = {
  selected?: boolean;
  selectList: (id?: string) => void;
};

type OptionalProps =
  | {
      editable: true;
      listId: string;
      listName?: string;
      deleteList: (id: string) => void;
      renameList: (id: string) => void;
    }
  | {
      /**Uncategorized */
      editable?: false;
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
    background-color: rgb(44, 46, 51);
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

export const ListItem = ({
  listId,
  listName,
  selected,
  deleteList,
  renameList,
  selectList,
  editable,
}: CommonProps & OptionalProps) => {
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
        <StyledListContent
          onClick={() => selectList(listId)}
          fw={selected ? 700 : "normal"}
        >
          {listName || "Uncategorized"}
        </StyledListContent>
        {menu}
      </StyledFlex>
    ),
    [listId, listName, menu, selectList, selected]
  );

  return render;
};
