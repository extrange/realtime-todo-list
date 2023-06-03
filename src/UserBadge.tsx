import { Text } from "@mantine/core";

type InputProps = {
  name?: string;
  color?: string;
};

export const UserBadge = ({ name, color }: InputProps) => {
  return (
    <Text
      className={"collaboration-cursor__label"}
      style={{
        position: "inherit",
        fontSize: "initial",
        display: "inline-block",
      }}
      bg={color}
      ta={"center"}
    >
      {name}
    </Text>
  );
};
