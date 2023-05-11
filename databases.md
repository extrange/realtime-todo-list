# Databases

I considered a few databases prior to settling with yjs for this app.

## Realtime Databases

These are databases which offer 2-way sync and offline support.

- PouchDB (simplest)

  - No need to write interface (REST/GraphQL) - this is already specified
  - Uses HTTP
  - Revision history is available
  - Access control: each user has their own database

- RxDB (more complex, but supports determining allowed documents)

  - A lot of premium features are gated...
  - Uses websockets
  - **Need to write own sync logic**

- WatermelonDB (more complex)

  - **Doesn't really implement realtime sync, have to debounce it (both for push and pull)**
  - Uses HTTP
  - Need to write sync logic

- GunDB

  - Code looks badly written
