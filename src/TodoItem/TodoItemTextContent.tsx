import styled from "@emotion/styled";
import {
  Text,
  TextProps,
  createPolymorphicComponent,
  useMantineTheme,
} from "@mantine/core";
import { observeDeep } from "@syncedstore/core";
import React, { useCallback, useEffect, useState } from "react";
import { Todo } from "../types/Todo";
import { getNotes, getTodoTitle } from "../util";

const _StyledText = styled(Text)`
  flex-grow: 1;
  overflow: hidden;
  cursor: default;
  user-select: none;
  overflow-wrap: anywhere;
`;

//https://mantine.dev/styles/styled/#polymorphic-components
const StyledText = createPolymorphicComponent<"div", TextProps>(_StyledText);

type InputProps = {
  todo: Todo;
};

export const TodoItemTextContent = React.memo(({ todo }: InputProps) => {
  const theme = useMantineTheme();

  // Initial render
  const [title, setTitle] = useState<string>(() => getTodoTitle(todo));
  const [notes, setNotes] = useState<string>(() => getNotes(todo));

  const onChange = useCallback(() => {
    setTitle(getTodoTitle(todo));
    setNotes(getNotes(todo));
  }, [todo]);

  // Attach observers manually, since we are not using useSyncedStore here
  // (simply accessing todo.content will not trigger rerenders on change)
  useEffect(
    () => observeDeep(todo.content, onChange),
    [todo.content, onChange]
  );

  return (
    <StyledText lineClamp={2} c={todo.completed ? "dimmed" : undefined}>
      <Text italic={!title} c={!title ? "dimmed" : undefined}>
        {title || "(untitled)"}
      </Text>
      <Text fz={theme.fontSizes.sm} italic c={"dimmed"}>
        {notes}
      </Text>
    </StyledText>
  );
});

TodoItemTextContent.displayName = "TodoItemTextContent";
