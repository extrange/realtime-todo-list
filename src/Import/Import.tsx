import { ActionIcon, Button, JsonInput, Modal, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useCallback, useRef } from "react";
import { LuImport } from "react-icons/lu";
import { z } from "zod";
import { useCurrentList } from "../useCurrentList";
import { useStore } from "../useStore";
import { addUploadedTodos } from "./util";

type InputProps = {
  closeNav: () => void;
};

const UploadSchema = z.array(
  z.object({
    title: z.string().optional(),
    notes: z.string().optional(),
    completed: z.boolean().optional(),
    modified: z.number().safe().optional(),
    created: z.number().safe().optional(),
  })
);

export type UploadedTodoArray = z.infer<typeof UploadSchema>;

export const Import = ({ closeNav }: InputProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const store = useStore();
  const [currentListId] = useCurrentList();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jsonRef = useRef<HTMLTextAreaElement>(null);

  const onClickOpen = useCallback(() => {
    open();
    closeNav();
  }, [closeNav, open]);

  const importTodos = useCallback(() => {
    const textContent = jsonRef.current?.value as string;

    const jsonParse = z
      .string()
      .transform((content) => {
        try {
          JSON.parse(content);
        } catch (e) {
          return z.NEVER;
        }
        return JSON.parse(content);
      })
      .pipe(UploadSchema);

    const result = jsonParse.safeParse(textContent);

    if (result.success) {
      addUploadedTodos(result.data, store, currentListId, console.log);
    } else {
      console.log(result.error.format());
    }
  }, [currentListId, store]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList?.length) return;

      fileList[0]
        .text()
        .then((t) => jsonRef.current && (jsonRef.current.value = t));
    },
    []
  );

  return (
    <>
      <Tooltip label="Import Todos" color="gray">
        <ActionIcon
          size="lg"
          onClick={onClickOpen}
          variant="light"
          color="primary"
          ml={10}
        >
          <LuImport />
        </ActionIcon>
      </Tooltip>
      <Modal opened={opened} onClose={close} title="Import Todos" size="lg">
        <div>Refer to the schema here</div>

        <div>Upload or Paste JSON</div>
        <Button onClick={() => fileInputRef.current?.click()}>Upload</Button>
        <input
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
          id="fileElem"
          accept="text/plain, application/json"
          style={{ display: "none" }}
        />
        <JsonInput minRows={20} ref={jsonRef} />
        <Button onClick={importTodos}>Import</Button>
      </Modal>
    </>
  );
};
