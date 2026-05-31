# AGENTS.md

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build (outputs to dist/)
npm run lint     # Biome check + tsc --noEmit (there is no separate typecheck command)
```

## Formatting & Linting

- **Biome** is the formatter and linter (not ESLint — ESLint is in devDeps but has no config).
- Biome enforces **tab indentation** (`indentStyle: "tab"`).
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are on.

## CI

- `.github/workflows/test.yml` runs `npm ci && npm run lint` on PRs.
- `.github/workflows/deploy.yaml` deploys `dist/` to `gh-pages` on push to `main`.
- Build requires env vars: `VITE_COMMIT_DATE`, `VITE_COMMIT_HASH`, `VITE_COMMIT_MSG` (used in `src/constants.ts`). Without them, the app uses `new Date()` as fallback for commit date.
- Pre-commit hooks: `biome check --write` + `tsc --noEmit`. No post-commit.

## Architecture

Single-package React 19 SPA (Vite + SWC). UI library: **Mantine v8**. No test suite.

**CRDT sync stack (critical):**
```
Yjs (CRDT doc) → SyncedStore (reactive proxy) → Hocuspocus (WebSocket provider)
                                              → y-indexeddb (offline persistence)
```

WebSocket server is hardcoded: `wss://tasks-server.nicholaslyz.com` (`StoreProvider.tsx:50`).

**Provider hierarchy (from `main.tsx`):**
`RoomProvider → StoreProvider → Login → ListProvider → App`

- `RoomProvider` — reads/writes `currentRoomId` in localStorage. No room = no connection.
- `StoreProvider` — creates Yjs doc, SyncedStore, Hocuspocus provider, IndexedDB. Cleans up on room change.
- `ListProvider` — tracks which list view is active (default: "focus").

**Dynamic module evaluation in `constants.ts`** — `USER_ID` reads `localStorage` at import time (not inside a hook). Do not move this to a function.

## SyncedStore reactivity rules

Read `readme.md` for full details. Key points:

- `useSyncedStore` / property access on a SyncedStore proxy tracks **which properties were accessed** during render. Conditionally accessed properties stop updating if not accessed in a subsequent render.
- Passing a proxied object to a child component: the child must call `useSyncedStore(object)` to subscribe to changes on that object. Props alone won't react.
- For complex Yjs types (e.g. `XmlFragment` like `todo.content`), property access alone does **not** trigger re-renders — use `observeDeep` manually.
- Tooltip (Mantine) causes `React.memo` to fail because it uses `React.cloneElement` on children.
- Performance: use raw Yjs accessors (`getYjsValue().toArray()`) over SyncedStore proxies when iterating large arrays (~2x faster for 10k items).

## Types

`src/types/Store.ts` defines the root SyncedStore shape: `{ todos: Todo[], storedUsers, meta, lists }`.
`todo.content` is `XmlFragment` (TipTap rich-text), not a plain string.
`todo.sortOrder` / `todo.focusSortOrder` use fractional indexing (`fractional-indexing` package).

## Yjs XmlFragment / TipTap content serialization

`todo.content` is a `Y.XmlFragment` containing `Y.XmlElement` (block/inline nodes) and `Y.XmlText` (text with formatting marks).

**Accessing the underlying Yjs types from SyncedStore proxies:**
- `getYjsValue(todo)` → `Y.Map` — the todo's backing map
- `getYjsValue(todo).get("content")` → `Y.XmlFragment` — the raw content
- `getYjsValue(t.content)` does **not** unwrap nested XmlFragment proxies; always go through the YMap with `.get("content")`

**Serializing text formatting (bold, italic, links, strikethrough, code):**
- `Y.XmlText.getAttributes()` returns **DOM attributes** (`_domAttributes`) only — it does **not** include TipTap formatting marks. It will always be `{}` for normally formatted text.
- Use `Y.XmlText.toDelta()` instead, which returns `[{ insert: string, attributes?: Record<string, unknown> }]`. The `attributes` contain the actual formatting marks (e.g. `{ bold: true }`, `{ link: { href: "..." } }`, `{ strike: true }`).
- `Y.XmlText.toString()` includes embedded XML tags for inline elements like links — do not use it for content serialization.

**Deserializing text formatting:**
- Create a `new Y.XmlText()`, then call `yText.applyDelta(delta)` to atomically restore the full text + formatting in one operation. This avoids ordering issues from separate `insert`/`format` calls.

**Import/export lives in `src/Import/`** — see `util.tsx` for `serializeTodoContent`, `deserializeTodoContent`, `exportData`, `importData`. The `SerializedNode` type uses a `delta` array for text nodes (not a plain `text` string) to preserve formatting round-trips.
