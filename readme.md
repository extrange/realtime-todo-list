# Lists App

An app to manage tasks within multiple lists, with realtime + offline synchronization, and collaborative editing.

## Features

### Full Offline Support

- [x] Working CRUD when offline
- [ ] PWA (so app can be launched without network)
- [ ] Check if sync on reconnection works

### Realtime Synchronization

- [x] Provided via yjs
- [x] Offline persistence

### UI

- [x] Collaborative cursor
- [x] Allow name change
- [ ] Indicator beside note if recently modified before last seen (color of person)
- [ ] Inline editing/creation vs dialog boxes
- [ ] Strip newlines on saving
- [ ] Show IndexedDB notification
- [ ] Reordering
- [ ] Show connection/sync status indicator (offline, syncing)
- [ ] Support tasklists
- [ ] Support task notes
- [ ] Global error handling with snackbars
- [ ] Restore tasks
- [ ] Restore lists
- [ ] View revision history of tasks
- [ ] Search tasks/lists
- [ ] Multiple lists
- [ ] Due date support
- [ ] Repeat support
- [ ] Ability to add to a 'Focus' view
- [ ] Markdown support (live editor style)
- [ ] RTF Editor (Mantine)

### Authentication

- [ ] Support multiple users

### Misc

- [x] Detect browser IndexedDB compatibility 

## Todo After Implementation

- Shared task list with Chanel
  - add make xiao long bao to one of the tasks
  - add make chocolate ganache (with erythritol?)
  - add make meringue
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
