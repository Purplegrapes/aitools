# Alova Guidelines

## Core Rule
- `src/api` and sub-package `api` modules only create and export alova `Method`.
- Pages, components, and composables must trigger requests through `useRequest` or `useWatcher`.
- Do not call `.send()` on a freshly created Method like `getFoo().send()`.

## Standard Pattern
```ts
const { data, loading, error, send } = useRequest(
  () => getFoo(params.value),
  {
    immediate: false,
    onError: () => undefined,
  },
)

async function refresh() {
  await send()
}
```

## Mutation Pattern
```ts
const { send: sendCreateFoo } = useRequest(
  (payload: CreateFooPayload) => createFoo(payload),
  {
    immediate: false,
    onError: () => undefined,
  },
)

async function handleSubmit(payload: CreateFooPayload) {
  await sendCreateFoo(payload)
}
```

## State Rules
- Prefer `data`, `loading`, `error` from `useRequest` as the source of truth.
- Only keep extra local state when it represents UI meaning that request state cannot express clearly, such as:
  - whether the page already has a usable snapshot
  - whether the current refresh mode is `full` or `list-only`
- Do not hand-roll parallel request state machines when computed state from `useRequest` is enough.

## Refresh Rules
- Initial page entry can combine multiple requests if the UI depends on all of them.
- Mutation after-effects should refresh the minimum required data.
- If a secondary sync request fails after a successful mutation, keep the mutation result authoritative and degrade gracefully.

## API Module Rules
- Keep headers and params in the correct alova argument position.
- `Delete` must use `Delete(url, data, config)`.
- Example:
```ts
return alovaInstance.Delete('/api/foo/1', undefined, {
  headers: {
    uid: '1',
  },
})
```

## Guardrail
- Run `pnpm lint:alova` before commit when touching request code.
- `pre-commit` already runs this check automatically.
