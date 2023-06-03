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

export const DOCUMENT_NAME =
  import.meta.env.MODE === "development" ? "test" : "default";
