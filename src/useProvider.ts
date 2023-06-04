import { useContext } from "react";
import { ProviderContext } from "./ProviderContext";

/**The HocusPocus provider, connected to the current room.
 * Use this to update awareness and set event handlers.
 */
export const useProvider = () => {
  const provider = useContext(ProviderContext);
  if (!provider) throw Error("Provider context is undefined");
  return provider;
};
