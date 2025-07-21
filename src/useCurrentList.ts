import { useContext } from "react";
import { ListContext } from "./ListContext";

/** Get/set the currently active listId.*/
export const useCurrentList = () => {
	const { currentList, setCurrentList } = { ...useContext(ListContext) };

	if (!setCurrentList)
		throw Error(
			"ListContext not provided. useCurrentList must be used within a ListProvider.",
		);

	return [currentList, setCurrentList] as const;
};
