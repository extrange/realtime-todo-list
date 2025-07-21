import { debounce } from "lodash-es";
import { useEffect, useState } from "react";
import { useProvider } from "./useProvider";

export interface AwarenessState {
	/**This is only used by the editor.
	 * store.storedUser is the source of truth, not this*/
	user?: {
		name: string;
		color: string;
	};
	/**Used by the editor. */
	cursor?: null | object;

	/**The value of userId in localStorage.
	 * This uniquely ties multiple provider.awareness.ClientIds
	 * to one user (e.g. if multiple of the same tab open). */
	userId?: string;

	/**The current task the user is editing. If the user is not
	 * editing anything, they are either online, or idle.  */
	editingId?: string;
}

export type AwarenessMap = Map<number, AwarenessState>;

/**
 * Fires on change in awareness. Debounced.
 *
 * Awareness disappears on desktop browser close, or after ~30s of closing browser on mobile.
 *
 * Yjs seems to fire an awareness update every few seconds.
 *
 * Not (yet) suitable for use in dependency arrays.
 */
export const useAwareness = () => {
	const provider = useProvider();
	const [state, setState] = useState<{ value: AwarenessMap }>({
		value: provider.awareness?.states ?? new Map(),
	});

	useEffect(() => {
		const debouncedUpdate = debounce(
			() => setState({ value: provider.awareness?.states ?? new Map() }),
			1000,
			{ maxWait: 1000 },
		);

		provider.on("awarenessChange", debouncedUpdate);

		return () => void provider.off("awarenessChange", debouncedUpdate);
	}, [provider]);

	return state.value;
};
