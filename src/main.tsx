import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

import { ErrorBoundary } from "react-error-boundary";
import { Fallback } from "./Fallback.tsx";
import { IdleDetect } from "./IdleDetect.tsx";
import { Login } from "./Login.tsx";
import { RoomProvider } from "./RoomProvider.tsx";
import { StoreProvider } from "./StoreProvider.tsx";
import "./app.css";
import { ReloadPrompt } from "./reloadPrompt.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Application Error encountered.</div>}>
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
        <ReloadPrompt />
        <Notifications />
        <RoomProvider>
          <StoreProvider>
            <Login>
              {/* This uses the provider */}
              <ErrorBoundary FallbackComponent={Fallback}>
                <IdleDetect />
                <App />
              </ErrorBoundary>
            </Login>
          </StoreProvider>
        </RoomProvider>
      </MantineProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
