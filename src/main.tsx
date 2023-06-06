import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

import { ErrorBoundary } from "react-error-boundary";
import { Fallback, FallbackWithoutDebugTools } from "./Fallback.tsx";
import { IdleDetect } from "./IdleDetect.tsx";
import { ListProvider } from "./ListProvider.tsx";
import { Login } from "./Login.tsx";
import { ReloadPrompt } from "./ReloadPrompt.tsx";
import { RoomProvider } from "./RoomProvider.tsx";
import { StoreProvider } from "./StoreProvider.tsx";
import "./app.css";

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
        <ErrorBoundary FallbackComponent={FallbackWithoutDebugTools}>
          <RoomProvider>
            <StoreProvider>
              <Login>
                {/* There may be no provider available (e.g. if user has not selected a room) */}
                <ErrorBoundary FallbackComponent={Fallback}>
                  <ListProvider>
                    <IdleDetect />
                    <App />
                  </ListProvider>
                </ErrorBoundary>
              </Login>
            </StoreProvider>
          </RoomProvider>
        </ErrorBoundary>
      </MantineProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
