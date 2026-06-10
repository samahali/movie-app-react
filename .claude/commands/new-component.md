# /new-component

Scaffold a new reusable UI component for the movie-app.

## Usage

```
/new-component <ComponentName> [description of what it renders and what props it accepts]
```

Examples:
```
/new-component MovieCard displays a movie poster, title, and rating; accepts a Movie object as a prop
/new-component GenreFilter renders a list of genre pills; accepts genres array and onSelect callback
```

## What This Does

1. Reads `src/components/` to check if a similar component already exists — reuse before creating.
2. Creates `src/components/<ComponentName>/<ComponentName>.tsx`.
3. Defines a TypeScript `interface` for the component's props at the top of the file.
4. Uses shadcn primitives where applicable (`Card`, `Badge`, `Button`, `Skeleton`, etc.).
5. Applies Tailwind classes for all styling.
6. Exports the component as a named export.

## Output Checklist

Before finishing, confirm:
- [ ] Component created at `src/components/<ComponentName>/<ComponentName>.tsx`
- [ ] Props interface defined and exported
- [ ] shadcn primitives used where appropriate
- [ ] No inline styles — Tailwind only
- [ ] `cn()` used for conditional class merging
- [ ] Component handles edge cases (missing image, empty array, etc.)

## Rules

- TypeScript only — `.tsx` extension.
- One component per file.
- No `any` in props — every prop must be typed.
- No direct API calls inside components — accept data as props or call a hook.
- Do not edit `src/components/ui/` — that folder belongs to shadcn.
