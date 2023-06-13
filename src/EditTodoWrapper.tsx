import { SetStateAction } from "react";

import { Modal, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { EditDueDate } from "./EditDueDate";
import { Editor } from "./Editor";

type InputProps = {
  editingId?: string;
  setEditingId: React.Dispatch<SetStateAction<string | undefined>>;
};

export const EditTodoWrapper = React.memo(
  ({ editingId, setEditingId }: InputProps) => {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    return (
      <>
        <Modal
          opened={!!editingId}
          fullScreen={isMobile}
          size={"min(70%, 800px)"} // Not applied if fullScreen=True
          styles={{ overlay: { backdropFilter: "blur(2px)" } }}
          onClose={() => setEditingId(undefined)}
        >
          {editingId && <EditDueDate todoId={editingId} />}
          {editingId && <Editor editingId={editingId} />}
        </Modal>
      </>
    );
  }
);
