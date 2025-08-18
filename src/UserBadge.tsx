import { Text } from "@mantine/core";

type InputProps = {
	name?: string;
	color?: string;
	small?: boolean;
};

/**The user badge as displayed by the Tiptap collaborative editor,
 * but with all sides rounded.
 */
export const UserBadge = ({ name, color, small }: InputProps) => {
	return (
		<Text
			className={"collaboration-carets__label"}
			style={{
				position: "static",
				fontSize: small ? "10" : "inherit",
				display: "inline-block",
				borderRadius: 3,
			}}
			bg={color}
			ta={"center"}
			m={5}
			maw={"min-content"}
		>
			{name}
		</Text>
	);
};
