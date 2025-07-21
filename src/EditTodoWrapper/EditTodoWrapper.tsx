import { Flex, Modal, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useCallback } from "react";
import ReactTimeago from "react-timeago";
import { useAppStore } from "../appStore/appStore";
import { EditDueDate } from "../EditDueDate";
import { Editor } from "../Editor";
import { reactTimeAgoFormatter } from "../util";
import classes from "./EditTodoWrapper.module.css";
import { HeaderContent } from "./HeaderContent";
import { TooltipWithTime } from "./TooltipWithTime";

export const EditTodoWrapper = React.memo(() => {
	const theme = useMantineTheme();
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
	const editingTodo = useAppStore((state) => state.editingTodo);
	const setEditingTodo = useAppStore((state) => state.setEditingTodo);

	const onClose = useCallback(() => setEditingTodo(), [setEditingTodo]);

	return (
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
							<HeaderContent />
							<Modal.CloseButton />
						</Modal.Header>
						<Modal.Body>
							<EditDueDate />
							<Editor />
							<Flex justify={"flex-end"} align={"center"} pt={5}>
								<TooltipWithTime date={editingTodo.created}>
									Created{" "}
									<ReactTimeago
										formatter={reactTimeAgoFormatter}
										date={editingTodo.created}
									/>
								</TooltipWithTime>
							</Flex>
						</Modal.Body>
					</>
				)}
			</Modal.Content>
		</Modal.Root>
	);
});

EditTodoWrapper.displayName = "EditTodoWrapper";
