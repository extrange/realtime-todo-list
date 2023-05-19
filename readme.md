# Lists App

An app to manage tasks within multiple lists, with realtime + offline synchronization, and collaborative editing.

## Features

### Full Offline Support

- [x] Working CRUD when offline
- [ ] PWA (so app can be launched without network) via `vite-plugin-pwa`
  - [ ] Visible versioning in bottom bar (link to latest commit+changelog)
- [ ] Check if sync on reconnection works

### Realtime Synchronization

- [x] Provided via yjs
- [x] Offline persistence

### UI

- [x] Collaborative cursor
- [x] Allow name change
- [ ] Don't show html tags in preview
- [ ] Show mobile/pc icon beside cursor
- [ ] Github link
- [ ] Tiptap header component
- [ ] Reordering
- [ ] Scratchpad (kiv drawing?)
- [ ] Indicator beside note if recently modified before last seen (color of person)
- [ ] Show last modified by who
- [ ] Inline editing/creation vs dialog boxes
- [ ] Strip newlines on saving
- [ ] Show IndexedDB notification
- [ ] Show connection/sync status indicator (offline, syncing)
- [ ] Support tasklists
- [ ] Global error handling with snackbars
- [ ] Restore tasks
- [ ] Restore lists
- [ ] View revision history of tasks
- [ ] Search tasks/lists
- [ ] Multiple lists
- [ ] Due date support
- [ ] Repeat support
- [ ] 'Focus' view for tasks
- [ ] Markdown support (live editor style)
- [ ] RTF Editor (Mantine)

### Authentication

- [ ] Support multiple users

### Misc

- [x] Detect browser IndexedDB compatibility 
- [ ] i wanted a daily notification like its your task list of the day which includes
- due today
- in progress (i.e. items that you shld be working on due at a later date but requires more than one day to do)
Chanel Ng, [18/5/23 6:40 PM]
mm no not notifications 

i was thinking of more like comments. i made this change and i want to highlight it to you. so i leave a message on the board which u could see when you logon. there is a tick button which u can tick to acknowledge read then its goneee.

Chanel Ng, [18/5/23 6:41 PM]
alternatively, its like i submit a message which then gets push to telegram which i might as well send myself haha

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
