import {
	type BadgeProps,
	Box,
	type BoxProps,
	Flex,
	Indicator,
	Text,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { OfflineUser, OnlineUser } from "./getUserStatus";
import { UserBadge } from "./UserBadge";
import classes from "./UserStatus.module.css";
import { useStore } from "./useStore";
import { getTodoTitle } from "./util";

type InputProps =
	| {
			online: true;
			userData: OnlineUser;
	  }
	| {
			online?: false;
			userData: OfflineUser;
	  };

type OtherProps = {
	/**Whether to only show the badge, and omit last seen/idle/editing status. */
	details?: boolean;
	badgeProps?: BadgeProps;
	boxProps?: BoxProps;
};

/**How long since lastActive a user is considered to be idle */
const CONSIDERED_IDLE_MS = 30000;

/**Display refresh rate */
const REFRESH_INTERVAL = 5000;

/**Expands on UserBadge, showing indicators if online, offline or idle.
 *
 * Optionally also shows more information if `details` is true:
 * If online, shows if idle, and what they are editing.
 * If offline, shows last seen.
 */
export const UserStatus = ({
	online,
	userData,
	details = true,
	badgeProps,
	boxProps,
}: InputProps & OtherProps) => {
	/* This is necessary so that calculation of idle users is updated */
	const [time, setTime] = useState<number>(Date.now());
	const store = useStore();

	useEffect(() => {
		const intervalId = setInterval(() => setTime(Date.now()), REFRESH_INTERVAL);
		return () => clearInterval(intervalId);
	}, []);

	const isIdle = useMemo(
		() =>
			userData.lastActive
				? time - userData.lastActive > CONSIDERED_IDLE_MS
				: false,
		[userData.lastActive, time],
	);

	const badgeWithIndicator = useMemo(() => {
		const badge = (
			<UserBadge
				small
				name={userData.user?.name}
				color={online ? userData.user?.color : "grey"}
				{...badgeProps}
			/>
		);

		return (
			<Indicator
				color={online ? (isIdle ? "yellow" : "green") : undefined}
				position="middle-start"
				pl={online ? "md" : undefined}
				offset={8}
				disabled={!online}
			>
				{badge}
			</Indicator>
		);
	}, [badgeProps, isIdle, online, userData.user?.color, userData.user?.name]);

	/* 
  If online - show if editing or not, followed by idle status
  If offline: show last seen*/
	const statusSection = useMemo(() => {
		const items = [];

		if (online) {
			const editingTodos =
				userData.editingIds.size &&
				store.todos.filter((t) => userData.editingIds.has(t.id));

			if (editingTodos) {
				editingTodos.forEach((t) => {
					const title = getTodoTitle(t);
					items.push(
						<Flex align={"center"} key={t.id}>
							<IconPencil size={14} style={{ flexShrink: 0 }} />
							<Text lineClamp={1} fz={"sm"}>
								{title || (
									<Text component="span" fs="italic" fz={"sm"}>
										unnamed
									</Text>
								)}
							</Text>
						</Flex>,
					);
				});
			}

			if (isIdle && userData.lastActive) {
				items.push(
					<Text c={"yellow"} fz={"sm"} key="idle">
						Idle {formatDistanceToNow(userData.lastActive)}
					</Text>,
				);
			}
		} else if (userData.lastActive) {
			items.push(
				<Text c="dimmed" fz={"sm"} key="lastActive">
					Last active{" "}
					{formatDistanceToNow(userData.lastActive, {
						addSuffix: true,
					})}
				</Text>,
			);
		}

		return items;
	}, [isIdle, online, store.todos, userData]);

	return (
		<Box className={classes.container} p={"xs"} {...boxProps}>
			<Flex direction={"column"}>
				{badgeWithIndicator}
				{details && statusSection}
			</Flex>
		</Box>
	);
};
