import { Text, Tooltip } from "@mantine/core";
import { format } from "date-fns";
import React from "react";

type TooltipWithTimeProps = {
  date: number;
};

export const TooltipWithTime = React.memo(
  ({ date, children }: TooltipWithTimeProps & React.PropsWithChildren) => {
    return (
      <Tooltip label={format(date, "d MMM yy, h:mm a")}>
        <Text size="sm" c="dimmed" component="div">
          {children}
        </Text>
      </Tooltip>
    );
  }
);

TooltipWithTime.displayName = "TooltipWithTime";
