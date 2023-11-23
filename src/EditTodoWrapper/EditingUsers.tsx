import { BoxProps } from "@mantine/core";
import { useSyncedStore } from "@syncedstore/react";
import React, { useMemo } from "react";
import { UserStatus } from "../UserStatus";
import { getUserStatus } from "../getUserStatus";
import { Todo } from "../types/Todo";
import { useAwareness } from "../useAwareness";
import { useStore } from "../useStore";

type InputProps = {
  editingId: Todo["id"];
};

/**Shows badges of users currently editing the todo item */
export const EditingUsers = React.memo(({ editingId }: InputProps) => {
  const awareness = useAwareness();
  const store = useStore();
  const storedUsers = useSyncedStore(store).storedUsers;

  const boxProps: BoxProps = useMemo(() => ({ p: undefined }), []);

  return (
    <>
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
    </>
  );
});

EditingUsers.displayName = "EditingUsers";
