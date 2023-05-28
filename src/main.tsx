import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import TimeAgo from "javascript-time-ago";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withNormalizeCSS
      withGlobalStyles
      theme={{
        colorScheme: "dark",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
        fontFamilyMonospace:
          "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
        primaryColor: "blue",
      }}
    >
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
