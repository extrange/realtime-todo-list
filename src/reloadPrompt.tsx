import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconReload } from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_INTERVAL = 1 * 60 * 1000; //10s

const hasServiceWorker = () => "serviceWorker" in navigator;

const NoServiceWorker = () => {
  useEffect(() => {
    notifications.show({
      title: "No offline support",
      message: "Not available in private windows",
      color: "yellow",
      autoClose: false,
    });
  }, []);
  return null;
};

const withBrowserCheck = (Component: FC) => {
  return hasServiceWorker() ? Component : NoServiceWorker;
};

const _ReloadPrompt = () => {
  const {
    /* offlineReady: a one-time notification on SW install */
    offlineReady: [offlineReady],
    /* needRefresh: true if there is an SW update pending */
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("Service Worker registered.");
      r &&
        setInterval(() => {
          console.log("Checking for sw update");

          // Don't update if offline
          if (!navigator.onLine) return;

          // Check if server is up before attempting update
          fetch(swUrl, {
            cache: "no-store",
            headers: {
              cache: "no-store",
              "cache-control": "no-cache",
            },
          })
            .then((resp) => {
              if (resp.ok) r.update();
              else {
                throw new Error(
                  `Received invalid status code while updating SW: ${resp.status}, ${resp.statusText}`
                );
              }
            })
            .catch((e) =>
              notifications.show({
                title: "Error updating SW",
                message: JSON.stringify(e),
                color: "red",
              })
            );
        }, UPDATE_INTERVAL);
    },
    onRegisterError(e) {
      notifications.show({
        title: "Error registering SW",
        message: JSON.stringify(e),
        color: "yellow",
      });
    },
  });

  useEffect(() => {
    offlineReady &&
      notifications.show({
        message: "Ready to work offline",
        autoClose: 3000,
      });
  }, [offlineReady]);

  useEffect(() => {
    needRefresh &&
      notifications.show({
        title: "New update available!",
        color: "yellow",
        message: (
          <Button
            onClick={() => updateServiceWorker()}
            leftIcon={<IconReload />}
          >
            Reload now
          </Button>
        ),
        autoClose: false,
        withCloseButton: false,
      });
  }, [needRefresh, updateServiceWorker]);

  return null;
};

export const ReloadPrompt = withBrowserCheck(_ReloadPrompt);
