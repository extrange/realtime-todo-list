import { Flex, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { OfflineUser, OnlineUser } from "./getUserStatus";

type InputProps =
  | {
      online: true;
      userData: OnlineUser;
    }
  | {
      online?: false;
      userData: OfflineUser;
    };

export const UserStatus = ({ online, userData }: InputProps) => {
  const [time, setTime] = useState<number>(Date.now());

  /* User considered idle idle for > 30s */
  useEffect(() => {
    const intervalId = setInterval(() => setTime(Date.now()), 5000);
    return () => clearInterval(intervalId);
  }, []);
  const isIdle = useMemo(
    () => (userData.lastActive ? time - userData.lastActive > 5_000 : false),
    [userData.lastActive, time]
  );

  return (
    <Flex>
      <Text c={online ? "green" : undefined}>
        {online ? "Online" : "Offline"}
      </Text>
      <Flex direction={"column"}>
        <Text c={userData.user?.color}>{userData.user?.name}</Text>
        {online && !!userData.editingIds.size && <Text>Editing...</Text>}
        {online && isIdle && userData.lastActive && (
          <Text c={"yellow"}>
            Idle for {formatDistanceToNow(userData.lastActive)}
          </Text>
        )}
        {!online && userData.lastActive && (
          <Text>
            Last seen{" "}
            {formatDistanceToNow(userData.lastActive, {
              addSuffix: true,
            })}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
