import {
  Accordion,
  ActionIcon,
  AppShellHeader,
  Box,
  Burger,
  Button,
  CloseButton,
  Code,
  CopyButton,
  Flex,
  Modal,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconBrandGithub,
  IconCheck,
  IconCopy,
  IconInfoCircle,
} from "@tabler/icons-react";
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import TimeAgo from "react-timeago";
import { ListType } from "../ListContext";
import {
  COMMIT_HASH,
  COMMIT_MSG,
  CURRENT_ROOM_LOCALSTORAGE_KEY,
  RELEASE_DATE,
} from "../constants";
import { useCurrentList } from "../useCurrentList";
import { useStore } from "../useStore";
import { formatBytes } from "../util";
import classes from "./AppHeader.module.css";
import { AppHeaderNumUsersOnline } from "./AppHeaderNumUsersOnline";

type InputProps = {
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  asideOpen: boolean;
  setAsideOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DebugTools = lazy(() => import("../DebugTools"));

export const AppHeader = React.memo(
  ({ navOpen, setNavOpen, asideOpen, setAsideOpen }: InputProps) => {
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [storageEstimate, setStorageEstimate] = useState<
      StorageEstimate | undefined
    >();
    const theme = useMantineTheme();
    const [roomId] = useLocalStorage({ key: CURRENT_ROOM_LOCALSTORAGE_KEY });
    const [update, forceUpdate] = useState({});

    const store = useStore();
    const [currentList] = useCurrentList();
    const currentListName = useMemo(
      () =>
        currentList === ListType.Focus
          ? "Focus/Due"
          : (update && store.lists.find((l) => l.id === currentList)?.name) ??
            "Uncategorized",
      [currentList, store, update]
    );

    useEffect(
      () => void navigator.storage?.estimate().then(setStorageEstimate),
      []
    );

    /* Listen to changes in the current list name */
    useEffect(() => {
      const handleListNameChange = () => forceUpdate({});
      document.addEventListener("currentListNameChange", handleListNameChange);
      return () =>
        document.removeEventListener(
          "currentListNameChange",
          handleListNameChange
        );
    }, []);

    return (
      <>
        <Modal
          opened={showInfo}
          onClose={() => setShowInfo(false)}
          withCloseButton={false}
          classNames={{ overlay: classes.modal }}
        >
          <Table>
            <tbody>
              <tr>
                <td>Room URL:</td>
                <td>
                  <Flex align={"center"}>
                    <Code block className={classes.code}>
                      {window.location + "#" + roomId}
                    </Code>
                    <CopyButton value={window.location + "#" + roomId}>
                      {({ copied, copy }) => (
                        <ActionIcon variant="subtle" onClick={copy} mx={10}>
                          {copied ? <IconCheck /> : <IconCopy />}
                        </ActionIcon>
                      )}
                    </CopyButton>
                  </Flex>
                </td>
              </tr>
              <tr>
                <td>
                  <Text>Commit hash:</Text>
                </td>
                <td>
                  <Code block className={classes.code}>
                    {COMMIT_HASH}
                  </Code>
                </td>
              </tr>
              <tr>
                <td>Released:</td>
                <td>
                  {new Intl.DateTimeFormat("en-SG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Singapore",
                  }).format(RELEASE_DATE)}{" "}
                  (
                  <TimeAgo live={false} date={RELEASE_DATE} />)
                </td>
              </tr>
              <tr>
                <td>Changes:</td>
                <td>
                  <Code block className={classes.code}>
                    {COMMIT_MSG}
                  </Code>
                </td>
              </tr>
              <tr>
                <td>Storage used:</td>
                <td>
                  {storageEstimate?.quota && storageEstimate.usage
                    ? `${formatBytes(storageEstimate.usage)} of ${formatBytes(
                        storageEstimate.quota
                      )}`
                    : "Calculating..."}
                </td>
              </tr>
            </tbody>
          </Table>
          <Button
            leftSection={<IconBrandGithub />}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/extrange/realtime-todo-list"
            variant={"subtle"}
          >
            View on Github
          </Button>
          <Accordion>
            <Accordion.Item value="debugging">
              <Accordion.Control icon={<IconAlertTriangle />}>
                Debugging (dangerous!)
              </Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Suspense fallback="Loading...">
                    <DebugTools />
                  </Suspense>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Modal>

        {/* Main content */}
        <AppShellHeader className={classes.header}>
          <Burger
            opened={navOpen}
            onClick={() => setNavOpen((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            hiddenFrom="sm"
          />
          <Flex
            justify={"center"}
            align={"center"}
            className={classes.headerFlex}
            /* https://stackoverflow.com/questions/43934648/how-to-make-flexbox-items-shrink-correctly-when-in-a-nested-container */
            miw={0}
            px={"xs"}
          >
            <Text fz={"xl"} ta={"center"} className={classes.headerText}>
              {currentListName}
            </Text>
            <ActionIcon
              variant="subtle"
              mx={5}
              onClick={() => setShowInfo(true)}
            >
              <IconInfoCircle color={"grey"} />
            </ActionIcon>
          </Flex>
          <Box hiddenFrom="sm">
            {asideOpen ? (
              <CloseButton
                variant="subtle"
                c={theme.colors.gray[6]}
                onClick={() => setAsideOpen(false)}
                size="md"
              />
            ) : (
              <AppHeaderNumUsersOnline setAsideOpen={setAsideOpen} />
            )}
          </Box>
        </AppShellHeader>
      </>
    );
  }
);

AppHeader.displayName = "AppHeader";
