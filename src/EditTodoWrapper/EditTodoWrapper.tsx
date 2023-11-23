import { Flex, Modal, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useCallback } from "react";
import { EditDueDate } from "../EditDueDate";
import { Editor } from "../Editor";
import { useAppStore } from "../appStore/appStore";
import classes from "./EditTodoWrapper.module.css";
import { EditingUsers } from "./EditingUsers";

export const EditTodoWrapper = React.memo(() => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const editingTodo = useAppStore((state) => state.editingTodo);
  const setEditingTodo = useAppStore((state) => state.setEditingTodo);

  const onClose = useCallback(() => setEditingTodo(), [setEditingTodo]);

  return (
    <>
      <Modal.Root
        opened={!!editingTodo}
        fullScreen={isMobile}
        size={"min(70%, 800px)"} // Not applied if fullScreen=True
        onClose={onClose}
      >
        <Modal.Overlay className={classes.overlay} />
        <Modal.Content>
          {editingTodo && (
            <>
              <Modal.Header>
                <Flex className={classes.editingUsers}>
                  {editingTodo && <EditingUsers editingId={editingTodo.id} />}
                </Flex>
                <Modal.CloseButton className={classes.closeButton} />
              </Modal.Header>
              <Modal.Body>
                <EditDueDate />
                <Editor />
              </Modal.Body>
            </>
          )}
        </Modal.Content>
      </Modal.Root>
    </>
  );
});

EditTodoWrapper.displayName = "EditTodoWrapper";
