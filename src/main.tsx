import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

import { IdleDetect } from "./IdleDetect.tsx";
import { ReloadPrompt } from "./reloadPrompt.tsx";

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
        loader: "bars",
      }}
    >
      <IdleDetect />
      <ReloadPrompt />
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
