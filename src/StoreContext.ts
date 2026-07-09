import { createContext } from "react";
import type { MappedStoreType } from "./types/MappedStore";

export const StoreContext = createContext<MappedStoreType | undefined>(
	undefined,
);
