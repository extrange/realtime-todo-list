import { Text } from "@mantine/core";

type InputProps = {
  name?: string;
  color?: string;
  small?: boolean;
};

export const UserBadge = ({ name, color, small }: InputProps) => {
  return (
    <Text
      className={"collaboration-cursor__label"}
      style={{
        position: "inherit",
        fontSize: small ? "10" : "inherit",
        display: "inline-block",
      }}
      bg={color}
      ta={"center"}
      m={5}
    >
      {name}
    </Text>
  );
};
