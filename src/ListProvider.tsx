import React, { useMemo, useState } from "react";
import { ListContext } from "./ListContext";

export const ListProvider = ({ children }: React.PropsWithChildren) => {
  const [currentList, setCurrentList] = useState<string>();

  const providerValue = useMemo(() => ({currentList, setCurrentList}), [currentList])

  return (
    <ListContext.Provider value={providerValue}>{children}</ListContext.Provider>
  );
};
