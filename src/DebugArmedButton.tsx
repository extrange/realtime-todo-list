import { Button, ButtonProps, Flex, Switch } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/core/lib/core/factory/create-polymorphic-component";
import { SyntheticEvent, useCallback, useState } from "react";

/**Button which requires toggling a switch before it becomes active.
 *
 * Props are passed to the Button component.
 */
export const DebugArmedButton = ({
  onClick,
  children,
  ...props
}: React.PropsWithChildren<PolymorphicComponentProps<"button", ButtonProps>>)  => {
  const [enabled, setEnabled] = useState(false);

  const onChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setEnabled(e.currentTarget.checked);
  }, []);

  return (
    <Flex align={"center"} justify={"space-between"} maw="100%">
      <Button
        color={enabled ? "red" : "gray"}
        onClick={(e) => enabled && onClick?.(e)}
        fullWidth
        {...props}
        mr={10}
      >
        {children}
      </Button>
      <Switch checked={enabled} onChange={onChange} />
    </Flex>
  );
};
