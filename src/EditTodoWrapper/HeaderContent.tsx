import { BoxProps, Flex } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { useMemo } from "react";
import ReactTimeago from "react-timeago";
import { UserBadge } from "../UserBadge";
import { UserStatus } from "../UserStatus";
import { useAppStore } from "../appStore/appStore";
import { USER_ID } from "../constants";
import { getUserStatus } from "../getUserStatus";
import { useAwareness } from "../useAwareness";
import { useStore } from "../useStore";
import { reactTimeAgoFormatter } from "../util";
import classes from "./HeaderContent.module.css";
import { TooltipWithTime } from "./TooltipWithTime";

/**Shows badges of users currently editing the todo item, and last modified*/
export const HeaderContent = React.memo(() => {
  const editingTodo = useAppStore((state) => state.editingTodo);

  if (!editingTodo) {
    throw Error("editingId is undefined");
  }

  const editingId = editingTodo.id;
  const store = useStore();
  const awareness = useAwareness();
  const storedUsers = useSyncedStore(store).storedUsers;
  const { modified, by } = useSyncedStore(editingTodo);
  const byUser = useSyncedStore(store).storedUsers[by]?.user;

  const boxProps: BoxProps = useMemo(() => ({ p: undefined }), []);

  return (
    <>
      <Flex className={classes.editingUsers}>
        {[...getUserStatus(awareness, storedUsers).onlineUsers]
          .filter(([, v]) => v.editingIds.has(editingId))
          .map(([k, userData]) => (
            <UserStatus
              key={k}
              online
              userData={userData}
              details={false}
              boxProps={boxProps}
            />
          ))}
      </Flex>
      <TooltipWithTime date={modified}>
        {by === USER_ID ? (
          "You, "
        ) : (
          <UserBadge name={byUser?.name} color={byUser?.color} small />
        )}
        <ReactTimeago date={modified} formatter={reactTimeAgoFormatter} />
      </TooltipWithTime>
    </>
  );
});

HeaderContent.displayName = "HeaderContent";
