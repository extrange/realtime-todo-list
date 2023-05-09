# Lists App

An app to manage tasks within multiple lists, with realtime + offline synchronization.

## Features

### Full Offline Support

- [x] Working CRUD when offline
- [ ] Notification when offline
- [ ] PWA (so app can be launched without network)
- [ ] Database sync on reconnection (refine retry logic)

### Realtime Synchronization

- [x] Provided via PouchDB
- [ ] Conflict resolution (`diff` style)

### UI

- [ ] Show initial loading spinner
- CRUD:
  - [x] Create
  - [x] Read
  - [x] Update
  - [x] Delete
- [ ] Support task notes
- [ ] Global error handling with snackbars
- [ ] Use Views on backend for performance
- [ ] Restore tasks
- [ ] Restore lists
- [ ] View revision history of tasks
- [ ] Search tasks/lists
- [ ] Multiple lists
- [ ] Due date support
- [ ] Repeat support
- [ ] Arbitrary order of tasks within a list
- [ ] Ability to add to a 'Focus' view
- [ ] Markdown support (live editor style)
- [ ] RTF Editor (Mantine)

### Authentication

- [ ] Support multiple users
- [ ] KIV support shared task lists
- [ ] CouchDB authentication

### Misc

- [x] Detect browser IndexedDB compatibility with memory store as fallback

## Todo After Implementation

- Shared task list with Chanel
  - add make xiao long bao to one of the tasks
  - add make chocolate ganache (with erythritol?)
  - add make meringue
- Move TV series and documentaries and movies here?

## Tech Stack

### Database

- Postgres (for learning/performance)

### Backend

None

### Interface

This doesn't matter, as it is dependent on what connection type the replicated database uses.

### Frontend (Vite)

- Realtime Database:

  - [x] PouchDB (simplest, but only for 1 user/all documents shared)

    - [ ] **No observables, but could wrap with RxJS?**
    - No need to write interface (REST/GraphQL) - this is already specified
    - Uses HTTP
    - ?Slow, because whole document revision tree is stored. However this could be a feature!
    - Multiple users need multiple databases, and sharing is a problem

  - [ ] RxDB (more complex, but supports determining allowed documents)

    - A lot of premium features are gated...
    - Uses websockets
    - **Need to write sync logic**

  - [ ] WatermelonDB (more complex)

    - **Doesn't really implement realtime sync, have to debounce it (both for push and pull)**
    - Uses HTTP
    - Need to write sync logic

  - [ ] GunDB

    - Code looks badly written

- UI: Mantine
- Routing: React Router
- State Management: React Hooks, KIV Zustand
- Animation: AutoAnimate

## Collaborative Editing

[yjs][yjs] could be a solution, together with [HocusPocus] as a provider, optionally using [SyncedStore][syncedstore] on the frontend.

Server: Database just stores the Y document. Each item is a Y document, containing the list it belongs to and other things (probably a Y map).

Client side: a Y document syncs with both a remote provider, as well as a local IndexedDB for persistence.

Sync: I don't really know, but HocusPocus should manage it.

Data structure: Y-map of tasks? 

[yjs]: https://github.com/yjs/yjs
[hocuspocus]: https://tiptap.dev/hocuspocus
[syncedstore]: https://syncedstore.org/docs/