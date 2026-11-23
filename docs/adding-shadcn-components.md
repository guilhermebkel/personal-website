# Adding shadcn components

How to bring a control from the shadcn/ui registry (`https://ui.shadcn.com/docs/components`) without 404s or extra dependencies. Look the control up there first; do not hand-roll one a catalog entry covers. The adaptation rules are in `docs/adr/0004-shadcn-ui-as-the-component-library.md`.

## Project configuration

`components.json` sets `"style": "new-york"` (Radix base) and `"cssVariables": true`. Keep both: with `cssVariables: false` the CLI writes raw colors that are not valid classes.

## Steps

1. Preview: `pnpm dlx shadcn@latest add <name> --dry-run`. A 404 means the registry has no such item for this style, not a typo.
2. Install: `pnpm dlx shadcn@latest add <name>`; to reset a file, add `--overwrite`. Nothing of ours lives in `components/ui/`, so overwriting is safe.
3. Fix the output:
   - Undo what the CLI adds to `package.json` (it lists `cn`, an unrelated package). Revert `package.json` and `pnpm-lock.yaml` for that line.
   - Replace the `cn` import with `import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts"` and every `cn(` with `ClassNameUtil.merge(`. This is the only edit made to a `ui/` file.
   - Add only the packages the installed files import.
4. Add the intermediate in `components/` (`Dialog.tsx` for `ui/dialog.tsx`), as `Button.tsx` does: pass `variant={null}` and `size={null}`, reset what the library sets, add our classes with design-system tokens. A control with parts is a folder (`Dialog/index.tsx`, `Dialog/DialogContent.tsx`).
5. Add the intermediate to the exception list of `no-restricted-imports` in `.oxlintrc.json`, and a row to `design/system/README.md`.
6. Compare with the prototype (`docs/visual-check.md`).

## Do not

- Import `@components/ui/...` anywhere but an intermediate.
- Use the library's semantic classes (`bg-primary`, `text-muted-foreground`) in an intermediate: they have no value in our theme.
- Add a `cn` helper or `@/lib/utils`; use `ClassNameUtil.merge`.
