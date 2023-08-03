import { useCallback, useMemo } from "react";

import { Modal, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { EditDueDate } from "./EditDueDate";
import { Editor } from "./Editor";
import { useAppStore } from "./appStore/appStore";

export const EditTodoWrapper = React.memo(() => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const editingTodo = useAppStore((state) => state.editingTodo);
  const setEditingTodo = useAppStore((state) => state.setEditingTodo);

  const onClose = useCallback(() => setEditingTodo(), [setEditingTodo]);
  const styles = useMemo(
    () => ({ overlay: { backdropFilter: "blur(2px)" } }),
    []
  );

  return (
    <>
      <Modal
        opened={!!editingTodo}
        fullScreen={isMobile}
        size={"min(70%, 800px)"} // Not applied if fullScreen=True
        styles={styles}
        onClose={onClose}
      >
        {editingTodo && (
          <>
            <EditDueDate />
            <Editor />
          </>
        )}
      </Modal>
    </>
  );
});

EditTodoWrapper.displayName = "EditTodoWrapper";
