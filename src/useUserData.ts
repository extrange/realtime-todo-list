import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";
import { USER_ID, UserData, store } from "./store";
import { generateUser } from "./util";

const defaultUser: Required<UserData> = {
  lastActive: Date.now(),
  user: generateUser(),
};

/** Use userData in localStorage (source of truth). */
export const useUserData = () => {
  const [user, setUser] = useLocalStorage<Required<UserData>>({
    key: "user",
    defaultValue: defaultUser,
  });

  /* Sync changes with syncedStore */
  useEffect(() => {
    store.storedUsers[USER_ID] = user;
  }, [user]);

  return [user, setUser] as const;
};
