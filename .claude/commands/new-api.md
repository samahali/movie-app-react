# /new-api

Add a new TMDB API fetch function (and optionally a hook) to the project.

## Usage

```
/new-api <description of what to fetch>
```

Examples:
```
/new-api fetch movie credits (cast and crew) for a given movie ID
/new-api fetch trending actors for the week with pagination
/new-api fetch TV show details including seasons for a given show ID
```

## What This Does

1. Reads `src/util/API.ts` in full — checks for duplicates before adding anything.
2. Defines a TypeScript interface for the response shape in `src/types/tmdb.ts` (creates the file if missing).
3. Adds the fetch function to `src/util/API.ts` with a full JSDoc block.
4. Optionally creates a custom hook in `src/hooks/` if the user asks or if the fetch is likely to be called from multiple components.

## Fetch Function Template

```ts
/**
 * [What this fetches and from which endpoint]
 *
 * @param id - TMDB resource ID
 * @param page - Page number for paginated results (default: 1)
 * @returns Promise resolving to [InterfaceName]
 *
 * Example:
 * const credits = await fetchMovieCredits(550)
 */
export async function fetch<Name>(<params>): Promise<InterfaceName> {
  const response = await fetch(
    `${import.meta.env.VITE_TMDB_BASE_URL}/...`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) throw new Error(`TMDB error: ${response.status}`)
  return response.json() as Promise<InterfaceName>
}
```

## Output Checklist

Before finishing, confirm:
- [ ] No duplicate function already existed in `src/util/API.ts`
- [ ] Response interface defined in `src/types/tmdb.ts`
- [ ] Function exported from `src/util/API.ts`
- [ ] JSDoc includes `@param`, `@returns`, and an example
- [ ] Throws on non-OK HTTP status
- [ ] No hardcoded API key or base URL

## Rules

- Never hardcode `https://api.themoviedb.org` — always use `import.meta.env.VITE_TMDB_BASE_URL`.
- Never hardcode API keys — always use `import.meta.env.VITE_TMDB_API_KEY`.
- List endpoints accept a `page` param defaulting to `1`.
- No `any` — define an interface for every response.
