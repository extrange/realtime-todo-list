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

/**How long since lastActive a user is considered to be idle */
const CONSIDERED_IDLE_MS = 30000;

/**Display refresh rate */
const REFRESH_INTERVAL = 5000;

export const UserStatus = ({ online, userData }: InputProps) => {
  /* This is necessary so that calculation of idle users is updated */
  const [time, setTime] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setTime(Date.now()), REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const isIdle = useMemo(
    () =>
      userData.lastActive
        ? time - userData.lastActive > CONSIDERED_IDLE_MS
        : false,
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
