import styled from "@emotion/styled";
import {
  ActionIcon,
  Checkbox,
  Modal,
  NumberInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { shallow } from "zustand/shallow";
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

  const [hideDueTodos, setHideDueTodos] = useSettingsStore(
    (state) => [state.hideDueTodos, state.setHideDueTodos],
    shallow
  );

  const [onlyHideRepeating, setOnlyHideRepeating] = useSettingsStore(
    (state) => [state.onlyHideRepeating, state.setOnlyHideRepeating]
  );

  const onClick = useCallback(() => {
    open();
    closeNav();
  }, [closeNav, open]);

  return (
    <>
      <Tooltip label="Settings" color="gray">
        <ActionIcon
          size="lg"
          onClick={onClick}
          variant="light"
          color="primary"
          ml={10}
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>
      <Modal opened={opened} onClose={close} title="Settings" size={"lg"}>
        <StyledGrid>
          <Checkbox
            checked={hideDueTodos}
            onChange={(e) => setHideDueTodos(e.currentTarget.checked)}
          />
          <Text>
            Hide Todos due more than
            <NumberInput
              hideControls
              min={0}
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

          {hideDueTodos && (
            <>
              <Checkbox
                checked={onlyHideRepeating}
                onChange={(e) => setOnlyHideRepeating(e.currentTarget.checked)}
              />
              <Text>Only hide repeating Todos</Text>
            </>
          )}
        </StyledGrid>
      </Modal>
    </>
  );
});

Settings.displayName = "Settings";
