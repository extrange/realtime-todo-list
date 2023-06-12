import { SetStateAction, createContext } from "react";

export enum ListType {
  Focus = "focus",
}

export type IListContext = {
  currentList?: string | ListType;
  setCurrentList: React.Dispatch<SetStateAction<string | undefined>>;
};

/**Stores the ID of the currently selected list */
export const ListContext = createContext<IListContext | undefined>(undefined);
