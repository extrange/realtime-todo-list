import { ActionIcon, Modal, Switch, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import React, { useCallback } from "react";
import { shallow } from "zustand/shallow";
import { useSettingsStore } from "../appStore/settingsStore";

type InputProps = {
  closeNav: () => void;
};

/**Button and modal for accessing settings */
export const Settings = React.memo(({ closeNav }: InputProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [hideDueTodos, setHideDueTodos] = useSettingsStore(
    (state) => [state.hideDueTodos, state.setHideDueTodos],
    shallow
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
      <Modal opened={opened} onClose={close} title="Settings">
        <Switch
          checked={hideDueTodos}
          onChange={(e) => setHideDueTodos(e.currentTarget.checked)}
          label="Hide Todos not due today/overdue"
          labelPosition="left"
        />
      </Modal>
    </>
  );
});

Settings.displayName = "Settings";
