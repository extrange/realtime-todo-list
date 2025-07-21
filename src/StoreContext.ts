import type { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { createContext } from "react";
import type { Store } from "./types/Store";

export const StoreContext = createContext<
	MappedTypeDescription<Store> | undefined
>(undefined);
