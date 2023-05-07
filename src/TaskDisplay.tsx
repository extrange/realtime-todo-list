import { Ref, useRef, useState } from "react";
import { Task } from "./App";
import { TextInput, Text, Container, Flex } from "@mantine/core";
import { FocusTrap } from "@mantine/core";
import { forwardRef } from "react";

type inputProps = {
  task: Task;
  updateTask(task: Task): Promise<PouchDB.Core.Response> | undefined;
};

export const TaskDisplay = forwardRef(
  ({ task, updateTask }: inputProps, ref: Ref<HTMLDivElement>) => {
    const [edit, setEdit] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <Container
        ref={ref}
        px={5}
        style={{
          marginLeft: "unset",
          height: "2.5rem",
          flexGrow: 1,
        }}
        fluid
        onClick={() => setEdit(true)}
      >
        {" "}
        {edit ? (
          <FocusTrap active={edit}>
            <TextInput
              ref={inputRef}
              defaultValue={task.title}
              onBlur={() => {
                const changes = inputRef.current?.value !== task.title;
                if (changes) {
                  task.title = inputRef.current?.value || task.title;
                  updateTask(task)?.then(() => setEdit(false));
                } else setEdit(false);
              }}
            />
          </FocusTrap>
        ) : (
          <Flex align={"center"} style={{ height: "100%" }}>
            <Text>{task.title}</Text>
          </Flex>
        )}
      </Container>
    );
  }
);
