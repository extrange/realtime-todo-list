# Lists App

An app to manage tasks within multiple lists, with realtime + offline synchronization, and collaborative editing.

## Features

### Full Offline Support

- [x] Working CRUD when offline
- [x] PWA (so app can be launched without network) via `vite-plugin-pwa`
  - [x] Install prompt
  - [x] Show SW unsupported message
  - [x] Add manifest so it can be installed
  - [x] Cache svg, woff files
- [x] Show app version in top bar as an 'I' icon (commit message, link to latest commit+changelog)
- [x] Check if sync on reconnection works

### Realtime Synchronization

- [x] Provided via yjs
- [x] Offline persistence via IndexedDB

### UI

- [x] Fix not taking 100% of screen
- [x] Collaborative cursor
- [x] Allow name change
- [x] Github link 'I' icon dialog in topbar
- [x] Reordering (using fractional indexing)
  - [x] Fix re-ordering not working on mobile (dragOverlay?)
  - [x] Fix not working on mobile scroll
  - [x] Animation on dragend (flyback)
  - [ ] Animation on delete
  - [x] Animation on grab (scale up)
  - [ ] Fix disjoint on grabend
  - [x] Show item in original position still (dragoverlay)
  - [x] Fix z-index issues
  - [ ] Complete generateKeys and cleanKeys methods (e.g. duplicate additions offline) - listen to yArray insertions/changes to sortOrder?
- [x] Fix render NaN problem (react time-ago, happens after modifying)
- [ ] Show editor in a dialog instead
  - [x] Add close button (need global context)
  - [ ] Remember scroll position
- [ ] Indicator beside task if recently modified before last seen (color of person)
  - [ ] Show last modified by who
- Footer:
  - [ ] Show other users online/last online (max 2, sorted by most recent, ignore self)
  - [ ] Show sync status indicator (up to date, or last synced)
- [ ] Perf: wrap items in React.memo
- [x] Don't edit modified date if task is just opened for viewing
- [ ] Don't show html tags in preview
- [ ] Show mobile/pc icon beside cursor
- [ ] Tiptap header component
- [x] Move to useLocalStorage (sync settings across browser tabs)
- [ ] Strip newlines on saving
- [ ] Show IndexedDB notification
- [x] Show connection status indicator
  - [ ] Connection status show appear when back online for 3s, then fade
- [ ] Support tasklists
- [ ] Restore tasks
- [ ] Restore lists
- [ ] View revision history of tasks
- [ ] Search tasks/lists
- [ ] Due date support
- [ ] Repeat support
- [ ] 'Focus' view for tasks
- [x] Markdown support (live editor style)
- [ ] RTF Editor (Mantine)

### Authentication

- [ ] Support multiple users

### Misc

- [x] Detect browser IndexedDB compatibility
- [ ] i wanted a daily notification like its your task list of the day which includes
- due today
- in progress (i.e. items that you shld be working on due at a later date but requires more than one day to do)

i was thinking of more like comments. i made this change and i want to highlight it to you. so i leave a message on the board which u could see when you logon. there is a tick button which u can tick to acknowledge read then its goneee.

alternatively, its like i submit a message which then gets push to telegram which i might as well send myself haha

## Non-urgent

- [ ] Get pushed commits as an array (using [`toJSON](https://docs.github.com/en/actions/learn-github-actions/expressions#tojson)), and thus show all commits that were pushed, not just the most recent

## Todo After Implementation

- Move #Urgent to here (after due date + repeat support)
- Move TV series and documentaries and movies here?

## Database/Sync Solution

Uses [yjs][yjs], together with [HocusPocus] as a provider, optionally using [SyncedStore][syncedstore] on the frontend.

Server: Database just stores the Y document. Each item is a Y document, containing the list it belongs to and other things (probably a Y map).

Client side: a Y document syncs with both a remote provider, as well as a local IndexedDB for persistence.

Sync: I don't really know, but HocusPocus should manage it.

Data structure: Y-map of tasks?

See [here](databases.md) for previous options considered.

## Frontend

Built with Vite.

- UI: Mantine
- Routing: React Router
- State Management: React Hooks, KIV Zustand
- Animation: AutoAnimate

[yjs]: https://github.com/yjs/yjs
[hocuspocus]: https://tiptap.dev/hocuspocus
[syncedstore]: https://syncedstore.org/docs/
