import {
  ActionIcon,
  Burger,
  Button,
  Code,
  Flex,
  Header,
  MediaQuery,
  Modal,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconInfoCircle
} from "@tabler/icons-react";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { COMMIT_HASH, COMMIT_MSG, RELEASE_DATE } from "./constants";
import { NetworkStatus } from "./networkStatus";

type InputProps = {
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppHeader = ({ navOpen, setNavOpen }: InputProps) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const theme = useMantineTheme();

  return (
    <>
      <Modal
        opened={showInfo}
        onClose={() => setShowInfo(false)}
        withCloseButton={false}
      >
        <Table>
          <tbody>
            <tr>
              <td>
                <Text>Commit hash:</Text>
              </td>
              <td>
                <Code style={{ overflowWrap: "anywhere" }}>{COMMIT_HASH}</Code>
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
                <ReactTimeAgo date={RELEASE_DATE} />)
              </td>
            </tr>
            <tr>
              <td>Changes:</td>
              <td>{COMMIT_MSG}</td>
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
      </Modal>

      {/* Main content */}
      <Header height={48} sx={{ display: "flex", justifyContent: "center" }}>
        <Flex justify={"center"} align={"center"} sx={{ height: "100%" }}>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>
          <Text fz={"xl"} ta={"center"}>
            Tasks
          </Text>
          <ActionIcon mx={5} onClick={() => setShowInfo(true)}>
            <IconInfoCircle color={"grey"} />
          </ActionIcon>
          <NetworkStatus />
        </Flex>
      </Header>
    </>
  );
};
