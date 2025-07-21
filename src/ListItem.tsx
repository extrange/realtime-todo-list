import {
	ActionIcon,
	Box,
	Flex,
	Menu,
	Overlay,
	Portal,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconDotsVertical, IconTargetArrow } from "@tabler/icons-react";
import clsx from "clsx";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import { Counter } from "./Counter";
import classes from "./ListItem.module.css";
import { List } from "./types/List";

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
					<Menu opened={menuOpened} onChange={setMenuOpened}>
						<Portal>{menuOpened && <Overlay opacity={0} />}</Portal>
						<Menu.Target>
							<ActionIcon variant="subtle">
								<IconDotsVertical color={theme.colors.gray[6]} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item onClick={() => deleteList(list.id)}>Delete</Menu.Item>
							<Menu.Item onClick={() => renameList(list.id)}>Rename</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				) : (
					<Box className={classes.box} />
				),
			[
				deleteList,
				editable,
				list?.id,
				menuOpened,
				renameList,
				theme.colors.gray,
			],
		);

		const onClick = useCallback(
			/*Allow switching slow-rendering lists */
			() => startTransition(() => selectList(list?.id)),
			[list?.id, selectList],
		);

		return (
			<Flex
				className={clsx({
					[classes.selected]: selected,
					[classes.listItem]: !selected,
				})}
				align={"center"}
				pl={5}
			>
				{focus && <IconTargetArrow className={classes.iconTargetArrow} />}
				<Text
					className={classes.listContent}
					onClick={onClick}
					fw={selected ? 700 : "normal"}
				>
					{focus
						? `Focus/Due`
						: !list?.name
							? `Uncategorized`
							: `${list.name} `}
				</Text>

				{uncompletedTodosCount ? (
					<Counter count={uncompletedTodosCount} small />
				) : null}
				{menu}
			</Flex>
		);
	},
);
