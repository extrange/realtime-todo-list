import styled from "@emotion/styled";
import {
  ActionIcon,
  Modal,
  NumberInput,
  Switch,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { useSettingsStore } from "../appStore/settingsStore";

type InputProps = {
  closeNav: () => void;
};

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 10px;
  align-items: center;
`;

/**Button and modal for accessing settings */
export const Settings = React.memo(({ closeNav }: InputProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  // At present, this will cause a rerender on every setting change
  const {
    hideDueTodos,
    hideDueTodosDays,
    hideRepeating,
    upcomingDays,
    setUpcomingDays,
    setHideDueTodos,
    setHideRepeating,
    setHideDueTodosDays,
  } = useSettingsStore();

  const onClickOpen = useCallback(() => {
    open();
    closeNav();
  }, [closeNav, open]);

  const onDaysChange = useCallback(
    // If empty string is given, default to 0
    (days: number | string) => setHideDueTodosDays(Number(days)),
    [setHideDueTodosDays]
  );

  const onHideDueTodosChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setHideDueTodos(e.currentTarget.checked),
    [setHideDueTodos]
  );

  const onHideRepeatingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setHideRepeating(e.currentTarget.checked),
    [setHideRepeating]
  );

  const onUpcomingChange = useCallback(
    (days: number | string) =>
      // Do not allow days < 1
      setUpcomingDays(Number(days) < 1 ? 1 : Number(days)),
    [setUpcomingDays]
  );

  return (
    <>
      <Tooltip label="Settings" color="gray">
        <ActionIcon
          size="lg"
          onClick={onClickOpen}
          variant="light"
          color="primary"
          ml={10}
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>
      <Modal opened={opened} onClose={close} title="Settings" size={"lg"}>
        <StyledGrid>
          <Switch checked={hideDueTodos} onChange={onHideDueTodosChange} />
          <Text>
            Hide todos due more than
            <NumberInput
              value={hideDueTodosDays}
              onChange={onDaysChange}
              hideControls
              min={0}
              removeTrailingZeros
              precision={0}
              maw={50}
              mx={10}
              display={"inline-block"}
            />
            day(s) away
            <Tooltip
              label="Todos without due dates will still be shown."
              withinPortal
              color="gray"
            >
              <IconInfoCircle
                style={{
                  flexShrink: 0,
                  verticalAlign: "middle",
                  margin: "0 5px",
                }}
              />
            </Tooltip>
          </Text>

          <Switch checked={hideRepeating} onChange={onHideRepeatingChange} />
          <Text>
            Hide repeating todos that are not yet due
            <Tooltip
              label="They will still appear in Focus/Due."
              withinPortal
              color="gray"
            >
              <IconInfoCircle
                style={{
                  flexShrink: 0,
                  verticalAlign: "middle",
                  margin: "0 5px",
                }}
              />
            </Tooltip>
          </Text>

          <div />
          <Text>
            Upcoming: Show todos due at most
            <NumberInput
              value={upcomingDays}
              onChange={onUpcomingChange}
              hideControls
              min={1}
              removeTrailingZeros
              precision={0}
              maw={50}
              mx={10}
              display={"inline-block"}
            />
            day(s) away
          </Text>
        </StyledGrid>

        <Text mt={10} c="dimmed">
          Filters will be applied sequentially to each todo
        </Text>
      </Modal>
    </>
  );
});

Settings.displayName = "Settings";
