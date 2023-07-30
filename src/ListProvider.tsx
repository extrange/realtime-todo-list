import React, { useMemo, useState } from "react";
import { IListContext, ListContext } from "./ListContext";

export const ListProvider = ({ children }: React.PropsWithChildren) => {
  // Default to 'Focus'
  const [currentList, setCurrentList] = useState<
    IListContext["currentList"] | undefined
  >("focus");

  const providerValue = useMemo(
    () => ({ currentList, setCurrentList }),
    [currentList]
  );

  return (
    <ListContext.Provider value={providerValue}>
      {children}
    </ListContext.Provider>
  );
};
