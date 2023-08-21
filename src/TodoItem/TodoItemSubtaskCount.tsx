import { Badge, Center } from "@mantine/core";
import { getYjsValue, observeDeep } from "@syncedstore/core";
import { IconListCheck } from "@tabler/icons-react";
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import {
    YMap,
    YXmlElement,
    YXmlFragment,
    YXmlText,
} from "yjs/dist/src/internals";
import { Todo } from "../useSyncedStore";

type InputProps = {
  todo: Todo;
};

export const TodoItemSubtaskCount = React.memo(({ todo }: InputProps) => {
  const [total, setTotal] = useState<number | null>(null);
  const [checked, setChecked] = useState<number | null>(null);
  const onChange = useCallback(() => {
    let _total = 0;
    let _checked = 0;
    for (const el of (
      (getYjsValue(todo) as YMap<Todo[keyof Todo]>)?.get(
        "content"
      ) as YXmlFragment
    ).createTreeWalker(
      (yxml) => (yxml as YXmlElement).nodeName === "taskItem"
    )) {
      if ((el as YXmlElement | YXmlText).getAttribute("checked")) {
        _checked++;
      }
      _total++;
    }

    if (_total) {
      setTotal(_total);
      setChecked(_checked);
    } else {
      setTotal(null);
      setChecked(null);
    }
  }, [todo]);

  // Initial render, to avoid flash
  useLayoutEffect(() => onChange(), [onChange]);

  useEffect(
    () => observeDeep(todo.content, onChange),
    [todo.content, onChange]
  );

  return total ? (
    <Badge
      color={checked === total ? "green" : "blue"}
      leftSection={
        <Center>
          <IconListCheck size={14} />
        </Center>
      }
    >
      {checked}/{total}
    </Badge>
  ) : null;
});

TodoItemSubtaskCount.displayName = "TodoItemSubtaskCount";
