import {
  Accordion,
  ActionIcon,
  Burger,
  Button,
  CloseButton,
  Code,
  CopyButton,
  Flex,
  Header,
  MediaQuery,
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
  IconUsers,
} from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";
import { useErrorBoundary } from "react-error-boundary";
import TimeAgo from "react-timeago";
import { DebugTools } from "./DebugTools";
import {
  COMMIT_HASH,
  COMMIT_MSG,
  CURRENT_ROOM_LOCALSTORAGE_KEY,
  RELEASE_DATE,
} from "./constants";
import { useCurrentList } from "./useCurrentList";
import { useStore } from "./useStore";
import { formatBytes } from "./util";

type InputProps = {
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  asideOpen: boolean;
  setAsideOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppHeader = ({
  navOpen,
  setNavOpen,
  asideOpen,
  setAsideOpen,
}: InputProps) => {
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
      (update && store.lists.find((l) => l.id === currentList)?.name) ??
      "Uncategorized",
    [currentList, store, update]
  );

  const { showBoundary } = useErrorBoundary();

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
        styles={{ overlay: { backdropFilter: "blur(2px)" } }}
      >
        <Table>
          <tbody>
            <tr>
              <td>Room ID:</td>
              <td>
                <Flex align={"center"}>
                  <Code
                    block
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {roomId}
                  </Code>
                  <CopyButton value={roomId}>
                    {({ copied, copy }) => (
                      <ActionIcon onClick={copy} mx={10}>
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
                <Code
                  block
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
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
                <Code
                  block
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
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
          leftIcon={<IconBrandGithub />}
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
                <Button
                  variant="subtle"
                  onClick={() => showBoundary(new Error("Test Error Message"))}
                >
                  Throw error
                </Button>
                <DebugTools />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Modal>

      {/* Main content */}
      <Header height={48} sx={{ display: "flex", justifyContent: "center" }}>
        <Flex
          justify={"center"}
          align={"center"}
          sx={{ height: "100%", width: "100%" }}
          mx={10}
        >
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
              sx={{ flexGrow: 0 }}
            />
          </MediaQuery>
          <Flex justify={"center"} align={"center"} sx={{ flexGrow: 1 }}>
            <Text fz={"xl"} ta={"center"}>
              {currentListName}
            </Text>
            <ActionIcon mx={5} onClick={() => setShowInfo(true)}>
              <IconInfoCircle color={"grey"} />
            </ActionIcon>
          </Flex>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            {asideOpen ? (
              <CloseButton
                variant="subtle"
                c={theme.colors.gray[6]}
                onClick={() => setAsideOpen(false)}
                size="md"
              />
            ) : (
              <ActionIcon onClick={() => setAsideOpen((o) => !o)}>
                <IconUsers color={theme.colors.gray[6]} />
              </ActionIcon>
            )}
          </MediaQuery>
        </Flex>
      </Header>
    </>
  );
};
