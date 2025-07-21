import type { HocuspocusProvider } from "@hocuspocus/provider";
import { createContext } from "react";

export const ProviderContext = createContext<HocuspocusProvider | undefined>(
	undefined,
);
