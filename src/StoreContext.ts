import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { createContext } from "react";
import { Store } from "./useSyncedStore";

export const StoreContext = createContext<
  MappedTypeDescription<Store> | undefined
>(undefined);
