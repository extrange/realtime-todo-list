import { IconIndentDecrease, IconIndentIncrease } from "@tabler/icons-react";
import { createControl } from "./createControl";

export const IndentControl = {
	Increase: createControl({
		title: "Increase Indent",
		icon: <IconIndentIncrease size={"1rem"} stroke={1.5} />,
		action: (editor) => () =>
			editor
				.chain()
				.focus()
				.sinkListItem("listItem")
				.sinkListItem("taskItem")
				.run(),
	}),
	Decrease: createControl({
		title: "Decrease Indent",
		icon: <IconIndentDecrease size={"1rem"} stroke={1.5} />,
		action: (editor) => () =>
			editor
				.chain()
				.focus()
				.liftListItem("listItem")
				.liftListItem("taskItem")
				.run(),
	}),
};
