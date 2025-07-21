import {
	Button,
	Center,
	ColorPicker,
	Container,
	Modal,
	TextInput,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import React, { useState } from "react";
import { UserBadge } from "./UserBadge";
import { colors } from "./constants";
import { useUserData } from "./useUserData";

/** */
export const EditUser = React.memo(() => {
	const [edit, setEdit] = useState<boolean>(false);
	const [userData, setUserData] = useUserData();

	/* useForm doesn't work here, because it caches values from the
  first render. I would have to find a way to update the form state
  on initial load. */

	const onNameInput: React.FormEventHandler<HTMLInputElement> = ({
		currentTarget: { value: name },
	}) => setUserData((u) => ({ ...u, user: { ...u.user, name } }));

	const onColorInput = (color: string) =>
		color && setUserData((u) => ({ ...u, user: { ...u.user, color } }));

	return (
		<>
			<Modal
				opened={edit}
				onClose={() => setEdit(false)}
				returnFocus={false}
				styles={{ overlay: { backdropFilter: "blur(2px)" } }}
			>
				<Container>
					<Center pb={10}>
						<UserBadge name={userData.user.name} color={userData.user.color} />
					</Center>
					<TextInput
						value={userData.user.name}
						data-autofocus
						onInput={onNameInput}
						error={!userData.user.name && "You must enter a name"}
					/>
					<ColorPicker
						format={"hex"}
						swatches={colors}
						withPicker={false}
						fullWidth
						onChange={onColorInput}
						value={userData.user.color}
					/>
				</Container>
			</Modal>

			{/* Content starts here */}
			<Button
				rightSection={<IconPencil color={"white"} />}
				variant={"subtle"}
				onClick={() => setEdit(true)}
				fullWidth
				px={"xs"}
			>
				<UserBadge name={userData.user.name} color={userData.user.color} />
			</Button>
		</>
	);
});
