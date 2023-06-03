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

### UI - General

- [x] Fix not taking 100% of screen
- [x] Collaborative cursor
- [x] Allow name change
- [x] Github link 'I' icon dialog in topbar
- [x] Reordering (using fractional indexing)
  - [x] Fix re-ordering not working on mobile (dragOverlay?)
  - [x] Fix not working on mobile scroll
  - [x] Animation on dragend (flyback)
  - [x] Animation on grab (scale up)
  - [x] Show item in original position still (dragoverlay)
  - [x] Fix z-index issues
- [x] Fix render NaN problem (react time-ago, happens after modifying)
- [x] Info: show newlines for changes

### UI - Editor

- [x] Add close button (need global context)
- [x] Remember scroll position of todos (only if > 0 on close)
- [ ] Show title + last modified when and by who in header, truncated to 1 line
- [ ] Tap/click to edit - but must still be able to see other's cursor
- [x] Remove left padding
- [x] Catch tab key
- [ ] Scroll to last modified position on open (by any user)
- [ ] Mobile: remember scroll position
- [ ] Mobile: Fix placeholder text out of alignment
- [ ] Mobile: tap to edit
- [ ] Mobile: top bar disappearing on keyboard popup (tap to edit might fix this)
- [ ] Support links

### UI - Realtime

- [x] Indicator beside task if recently modified before last seen (color of person)
- [x] Show last modified by who
- [x] Fix useSyncStore not accepting identity function as default, then implement lastActive (AwarenessState) and editingId (yDoc) respectively...
- [x] Indicator not to show if no user 'lastOpened'
- [ ] Clear users older than 1 week on launch

### UI - Tasks

- [ ] Support tasklists
- [ ] Due date support
- [ ] 'Focus' view for tasks
- [ ] Suggest upcoming tasks due
- [ ] Restore tasks
- [ ] Restore lists
- [ ] View revision history of tasks
- [ ] Search tasks/lists
- [ ] Repeat support

### UI - Footer

- [x] Show other users online/last online (max 2, sorted by most recent, ignore self)
- [ ] Show online users if connected, otherwise show disconnected/syncing

### UI - Misc

- [ ] Attempt reconnection on network status change
- [x] Show toggle for aside on mobile
- [ ] Prompt for username on launch
- [x] Don't edit modified date if task is just opened for viewing
- [ ] Don't show html tags in preview
- [ ] Show mobile/pc icon beside cursor
- [x] Tiptap header component
- [ ] Show document outline on desktop in application sidebar
- [x] Move to useLocalStorage (sync settings across browser tabs)
- [ ] Strip newlines on saving
- [x] Show IndexedDB notification
- [x] Show connection status indicator
- [x] Markdown support (live editor style)
- [ ] RTF Editor (Mantine)
- [ ] Add background changing daily
- [ ] Support changing room
- [ ] Support chat in room

### Authentication

- [ ] Support username/password logon

### Undo/Snapshots

- [ ] Support snapshots (`ydoc.gc` to `false`, check perf)
- [ ] Support undo (within fixed interval/number of actions)

### Non-urgent

- [x] Improve Task.tsx rendering - subscribe to User object changes
- [x] useSyncedStore to accept selector and then only rerender on that selector change
- [x] Rewrite reactivity layer (for performance, also using store doesn't cause re-renders selectively)
- [ ] Get pushed commits as an array (using [`toJSON](https://docs.github.com/en/actions/learn-github-actions/expressions#tojson)), and thus show all commits that were pushed, not just the most recent
- [ ] Fix disjoint on grabend
- [ ] Animation on delete
- [x] Perf: wrap items in React.memo
- [x] Perf: don't deep equals in useAwareness

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

## Notes

A user can be online or offline, based on the awareness (fix issue with lag on users coming online).

They can also have a lastActive, independent of connectivity status. this can be used to calculate last seen and idle times.

Using an idle=true/false wouldn't let users see someone's last seen.

Someone who is offline: last seen at {lastActive}.

Someone who is online: either online/editing something, PLUS whether idle or not.

### ClientIDs

Turns out clientIds are always generated for every session.

We can only establish continuity of the current user by using localStorage to give the current user a GUID, and set that in storedUsers.

To link the awareness of the current user (a clientId) to the storedUser object in storedUsers: a user coming online will add its GUID to the awareness object.

Then, listening clients will ignore all awareness objects without a userId.

### Problems and Answers

Problem: What if the user duplicates tabs and edits a different document in either one? What should other clients show?

Answer: The scenario is:

awarenessID1 => user
awarenessID2 => user

We would have to 'reduce' each property, since lastActive, the stored property in localStorage, is shared across the clients. The reduce function for editingId could be something like showing a list of Todos the user is editing.

For future attributes e.g. 'typing...', a reduce function would have to be written.

Problem: Where to store the user object?

Answer: The StoredUser object should be stored in localStorage - the source of truth. Any changes to that object in localStorage should result in changes being written to the syncedStore.

[yjs]: https://github.com/yjs/yjs
[hocuspocus]: https://tiptap.dev/hocuspocus
[syncedstore]: https://syncedstore.org/docs/
