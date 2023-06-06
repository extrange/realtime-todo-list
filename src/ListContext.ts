import { SetStateAction, createContext } from "react";

type IListContext = {
  currentList?: string;
  setCurrentList: React.Dispatch<SetStateAction<string | undefined>>;
};

/**Stores the ID of the currently selected list */
export const ListContext = createContext<IListContext | undefined>(undefined);
