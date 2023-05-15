import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { MantineProvider } from "@mantine/core";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withNormalizeCSS
      withGlobalStyles
      theme={{ colorScheme: "dark" }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);
