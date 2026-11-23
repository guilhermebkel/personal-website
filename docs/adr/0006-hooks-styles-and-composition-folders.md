# Hooks and styles in their own folders, components as composition folders

`tocomevidencia` keeps its hooks (`useAudioRecorder.ts`) and its shared class strings (`ButtonClasses.ts`, `MotionClasses.ts`) inside `components/`, and writes a component with parts as a folder in the composition pattern. This site copied the first habit and skipped the second: a menu, two carousels and the post browser were single files of 100 lines or more, with their parts inside.

## Decision

- `hooks/` holds hooks shared by more than one component (`@hooks/useInView.ts`). A hook that belongs to one component sits in that component's folder as `use<Name>.ts`.
- `styles/` holds the class strings shared by more than one component (`@styles/ButtonClasses.ts`, `LinkClasses.ts`, `LayoutClasses.ts`). They are code, not components, so `local/tokens-only` and the other lint rules of `components/` apply to them too.
- A component with parts is a folder in `components/` (`docs/code-standards.md`, "Components"): `index.tsx` is the root and calls `use<Name>.ts`; `<Name>Context.ts` types the shared state and exports `use<Name>State()`, which throws naming the root; one file per part. `Navbar/`, `ProjectCarousel/`, `QuoteCarousel/` and `PostBrowser/` follow it. A leaf with no parts stays one file.
- `@hooks/*` and `@styles/*` are aliases in `tsconfig.json` and `vitest.config.mjs`; `.oxlintrc.json`, `eslint.config.mjs` and `knip.json` list the two folders next to `components/`.
- Looked at before writing: shadcn has `carousel` (Embla), `navigation-menu`, `select` and `toggle-group`. None fits: the carousels here are plain scroll-snap rows with a progress thumb or an auto-advancing quote, and the other controls are one `select` and two buttons.

## Cost

More files and more imports for a component with parts. In return a part can be read, changed and tested alone, and `components/` holds only components.
