import styled from "@emotion/styled";
import {
  Text,
  TextProps,
  createPolymorphicComponent,
  useMantineTheme,
} from "@mantine/core";
import { observeDeep } from "@syncedstore/core";
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import sanitizeHtml from "sanitize-html";
import { Todo } from "../useSyncedStore";
import { getTodoTitle } from "../util";

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

  const [title, setTitle] = useState<string>();
  const [notes, setNotes] = useState<string>();
  const [, startTransition] = useTransition();

  const onChange = useCallback(() => {
    /* Set the title */
    setTitle(getTodoTitle(todo));

    /* Set the notes */

    /* Take at most 300 chars of the todo's notes */
    const notesArray: string[] = [];

    // FIXME For very long strings, they are truncated prematurely before 200 chars
    todo.content.slice(1).every((e) => {
      notesArray.push(sanitizeHtml(e.toString()));
      return notesArray.join(" ").length < 200;
    });

    setNotes(notesArray.join(" "));
  }, [todo]);

  /* useLayoutEffect instead of useEffect to avoid a flash of 'untitled'
  Only affects initial render */
  useLayoutEffect(() => {
    onChange(); //Initial render
    return observeDeep(todo.content, () => startTransition(onChange));
  }, [todo.content,  onChange]);

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
