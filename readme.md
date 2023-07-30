# Lists App

An app to manage tasks within multiple lists, with realtime + offline synchronization, and collaborative editing.

## Known Issues

### `useSyncedStore`

- If a value is conditionally accessed, and during a render it is not accessed, it stops being updated for future renders.
- Accessing an array (e.g. `state.todos`) can result in either a shallow or deep listener depending on what properties were accessed
  - In `state.todos.length`, it is a shallow listener
  - In `state.todos.map(t => t.focus)`, it is a deep listener, but only on the `todo.focus` property

Notes:

- It appears to work like a hook, in that it remembers where a property accessor was used and triggers a rerender on that (via YJS event listeners)
- For better performance, I may want to use YJS event listeners if I only need say, additions/deletions in a list (not nested updates).
- To prevent the whole component rerendering for a small change in item,refactor components such that each component is only listening to the dependencies it needs.
- Memoize child components to prevent them re-rendering when the parent re-renders.
- Properties with frequent updates - use `useDeferredValue`/`useTransition` (but only if values are memoizable - see below)
- Simple properties e.g. `boolean`, `number` can be used as memoization dependencies.
  - [ ] Can they be deferred?
- If you pass a proxied value to a child, `useSyncedStore` is necessary to [set the event listener on the child][use-reactive]. For example, the following will not update to changes in `todo.focus`:

  ```ts
  const MyComponent = ({ todo }: { todo: Todo }) => {
    return todo.focus ? "focus" : "not focus";
  };
  ```

  Instead, do:

  ```ts
  const MyComponent = ({ todo: _todo }: { todo: Todo }) => {
    const todo = useSyncedStore(_todo);
    return todo.focus ? "focus" : "not focus";
  };
  ```

  - For complex properties e.g. `todo.content`, merely accessing the value will not trigger a re-render - it needs to be manually subscribed to with `observeDeep`.
  - In `<StrictMode>`, this will cause a double-render (once on the component mount, again within `useSyncedStore` as it calls `forceUpdate` internally when attaching the observer). It will not affect production.

### Tooltip

Tooltip causes `React.memo` to fail presumably because it uses `React.cloneElement`l [on its children][tooltip-clone-element].

### Performance

Benchmark (for 10,000 objects)

- `Array.forEach` (syncedStore proxy) - 100ms
- `getYjsValue().toArray().forEach` (raw Yjs) - 50ms
- `Object.entries(YMap).forEach` - 200ms
- `[...getYjsValue(YMap).entries()].forEach` - 50ms

Others:

- `Array.find` (within SyncedStore proxied objects) - around 20ms for 1000 objects

### React Profiler

- When using `<Profiler>` in a mapped array, you must also give it a `key` otherwise children will re-render whenever their parent does.
- The Profiler does not include time spent in callbacks (e.g. in ListView)

[use-reactive]: https://github.com/YousefED/reactive/blob/main/packages/reactive-react/src/useReactive.ts
[tooltip-clone-element]: https://github.com/mantinedev/mantine/blob/cf0f85faec56615ea5fbd7813e83bac60dbaefb7/src/mantine-core/src/Tooltip/Tooltip.tsx#L193
[yjs]: https://github.com/yjs/yjs
[hocuspocus]: https://tiptap.dev/hocuspocus
[syncedstore]: https://syncedstore.org/docs/
