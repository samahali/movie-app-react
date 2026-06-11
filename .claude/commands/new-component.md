# /new-component

Scaffold a new reusable UI component for CineVault.

## Usage

```
/new-component <ComponentName> [description and props]
```

Examples:
```
/new-component MovieCard displays a movie poster, title, and rating; accepts a Movie prop
/new-component GenreFilter renders genre pill buttons; accepts genres array and onSelect callback
```

## What This Does

1. Checks `src/components/` for a similar component — reuse before creating.
2. Creates `src/components/<ComponentName>/<ComponentName>.tsx`.
3. Defines and exports a typed `interface <ComponentName>Props`.
4. Uses shadcn primitives where applicable (`Card`, `Badge`, `Button`, `Skeleton`).
5. Applies Tailwind classes for all styling — no inline styles.
6. Exports the component as a named export.
7. Adds `data-testid` on key interactive elements for E2E targeting.

## Performance Notes

- If this component renders images: use `loading="lazy"` and size the container to prevent CLS.
- If this is a card that links to a detail page: consider adding `onMouseEnter` prefetch logic.
- Only use `React.memo` if the component is genuinely expensive and receives stable props.

## Output Checklist

- [ ] Component at `src/components/<ComponentName>/<ComponentName>.tsx`
- [ ] `interface <ComponentName>Props` defined and exported
- [ ] shadcn primitives used where applicable
- [ ] Tailwind only — no inline styles
- [ ] `cn()` used for conditional class merging
- [ ] Edge cases handled (missing image, empty array, undefined values)
- [ ] `data-testid` on key interactive elements
- [ ] Images use `loading="lazy"` with sized container

## Rules

- TypeScript only — `.tsx` extension.
- One component per file.
- No `any` in props.
- No direct API calls inside components — accept data as props or receive it from a hook.
- Do not edit `src/components/ui/` — that folder belongs to shadcn.
