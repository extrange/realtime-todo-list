import { v4 as uuidv4 } from "uuid";

export const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

export const RELEASE_DATE = new Date(import.meta.env.VITE_COMMIT_DATE);

export const COMMIT_HASH = import.meta.env.VITE_COMMIT_HASH;

export const COMMIT_MSG = import.meta.env.VITE_COMMIT_MSG;

/**The unique ID for a user, persisted in localStorage.*/
export const USER_ID = (() => {
  /* Check localStorage for a clientID, and generate one if not existing */
  /* User ID doesn't exist */
  const existingId = localStorage.getItem("userId");
  if (!existingId) {
    const userId = uuidv4();
    localStorage.setItem("userId", userId);
    return userId;
  } else {
    return existingId;
  }
})();

/**Array of saved room UUIDs */
export const SAVED_ROOMS_LOCALSTORAGE_KEY = 'savedRoomIds'

/**ID of currently active room */
export const CURRENT_ROOM_LOCALSTORAGE_KEY = 'currentRoomId'