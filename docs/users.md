# Users

## userId

On initialization, `localStorage` is checked for the `userId` key. If it is not present, a random UUID is generated and stored. Subsequent sessions on the same client will use the generated userId.

## UserData

The user's name, color and lastActive is stored in localStorage (the source fo truth). This is synced one-way to Yjs to `storedUsers` under `UserData`, which is a value under the user's userId (the key of `storedUsers`).

When the user changes their name, the `storedUsers` object is mutated. Since components lookup a user's `UserData` via the userId in the shared `storedUsers` object, this causes syncs across all browsers currently listening to the same document.

## Awareness

When a user edits a document, the `editingId` is set on the awareness object unique to that user (which is a key, the user's userId, under the global `AwarenessMap`).

Any other actions can be shared via that object. However, the user's object is destroyed on their disconnection.

## Structure

A user can be online or offline, based on the awareness.

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
