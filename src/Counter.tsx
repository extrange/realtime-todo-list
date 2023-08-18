import { Text, TextProps, useMantineTheme } from "@mantine/core";
import React from "react";

type InputProps = {
  count: number;

  /**Whether text should be small */
  small?: boolean;
};

/**Counter that shows 99+ when count is 100 or more. */
export const Counter = React.memo(
  ({ count, small, ...props }: InputProps & TextProps) => {
    const theme = useMantineTheme();
    return (
      <Text
        c="dimmed"
        sx={{
          whiteSpace: "nowrap",
          fontSize: small ? theme.fontSizes.sm : theme.fontSizes.md,
        }}
        {...props}
      >
        {count > 99 ? "99+" : count}
      </Text>
    );
  }
);

Counter.displayName = "Counter";
