import { SetStateAction, createContext } from "react";

export type IRoomContext = {
  roomId?: string ;
  setRoomId: React.Dispatch<SetStateAction<string|undefined>>;
};
export const RoomContext = createContext<IRoomContext | undefined>(undefined);