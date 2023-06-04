import { SetStateAction, createContext } from "react";

export type IRoomContext = {
  roomId?: string ;
  setRoomId: React.Dispatch<SetStateAction<string|undefined>>;
};
export const RoomContext = createContext<IRoomContext | undefined>(undefined);
/** Get/set the name of the current room.
 * Also the name of the underlying Yjs document.
 */
