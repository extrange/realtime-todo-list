import { useContext } from "react";
import { StoreContext } from "./StoreContext";

/**Returns the mutable store object as returned by syncedStore. Use
 * this to make changes to the store.
 *
 * Not suitable for memoization.
 */
export const useStore = () => {
	const store = useContext(StoreContext);
	if (!store) throw Error("Store context is undefined");
	return store;
};
