import { Button, Modal, TextInput } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import React, { useCallback, useState } from "react";
import { useStore } from "./useStore";
import { selectMeta, useSyncedStoreCustomImpl } from "./useSyncedStore";

export const EditRoom = () => {
  const meta = useSyncedStoreCustomImpl(selectMeta);
  const store = useStore();
  const [open, setOpen] = useState(false);

  const onNameInput: React.FormEventHandler<HTMLInputElement> = useCallback(
    ({ currentTarget: { value: name } }) => {
      store.meta.roomName = name;
    },
    [store]
  );

  /* Only allow closing if a roomName was set*/
  const onClose = useCallback(() => {
    store.meta.roomName && setOpen(false);
  }, [setOpen, store]);

  return (
    <>
      <Modal title="Enter a room name" opened={open} onClose={onClose}>
        <TextInput
          data-autofocus
          defaultValue={meta.roomName}
          error={!meta.roomName && "Room name cannot be empty"}
          onInput={onNameInput}
        />
      </Modal>
      <Button
        rightIcon={<IconPencil color={"white"} />}
        variant={"subtle"}
        onClick={() => setOpen(true)}
        fullWidth
        px={"xs"}
      >
        {meta.roomName || "Unnamed Room"}
      </Button>
    </>
  );
};
