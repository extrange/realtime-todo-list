import { Text, TextProps } from "@mantine/core";
import React from "react";
import classes from "./Counter.module.css";
import clsx from "clsx";

type InputProps = {
	count: number;

	/**Whether text should be small */
	small?: boolean;
};

/**Counter that shows 99+ when count is 100 or more. */
export const Counter = React.memo(
	({ count, small, ...props }: InputProps & TextProps) => {
		return (
			<Text
				c="dimmed"
				className={clsx({
					[classes.small]: small,
					[classes.counter]: true,
				})}
				{...props}
			>
				{count > 99 ? "99+" : count}
			</Text>
		);
	},
);

Counter.displayName = "Counter";
