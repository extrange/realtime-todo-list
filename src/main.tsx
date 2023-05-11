import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "./Provider.tsx";
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
      <Provider />
    </MantineProvider>
  </React.StrictMode>
);
