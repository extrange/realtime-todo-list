import { Center } from "@mantine/core";
import { IconCloud, IconCloudOff } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export const NetworkStatus = () => {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <Center sx={{ padding: "0 10px" }}>
      {online ? (
        <IconCloud color={"grey"} />
      ) : (
        <IconCloudOff color={"orange"} />
      )}
    </Center>
  );
};
