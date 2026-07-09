import { Button, type ButtonProps, Flex, Switch } from "@mantine/core";
import { type SyntheticEvent, useCallback, useState } from "react";

type DebugArmedButtonProps = ButtonProps & {
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

/**Button which requires toggling a switch before it becomes active.
 *
 * Props are passed to the Button component.
 */
export const DebugArmedButton = ({
	onClick,
	children,
	...props
}: DebugArmedButtonProps) => {
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
