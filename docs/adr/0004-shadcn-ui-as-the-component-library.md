# shadcn/ui as the component library

## Decision

- shadcn/ui is the base of the components, as in `tocomevidencia` (its ADR 0019): the owner prefers updating a library's controls to the design system over rebuilding them. Its files are copied into `components/ui/` (`components.json` configures the CLI, style `new-york`, Radix primitives).
- The app never imports from `components/ui/`. Each library control has an intermediate in `components/` (`Button.tsx`) that passes `variant={null}` and `size={null}` to turn the library's look off and adds our classes, written with the design-system tokens (`styles/ButtonClasses.ts`). `no-restricted-imports` in `.oxlintrc.json` enforces it, and the intermediate is its only exception.
- A `ui/` file is registry output, reinstalled with `pnpm dlx shadcn@latest add <name> --overwrite` and changed only to merge classes through `ClassNameUtil.merge` instead of the `cn` the CLI writes (`docs/adding-shadcn-components.md`).
- Classes merge through `ClassNameUtil` (`clsx` and `tailwind-merge`) in `src/Utils/`. Icons are Lucide (`lucide-react`).
- `components/ui/` is excluded from lint and from knip's exports; nothing else is ignored.

## Cost

Every library control needs an intermediate before the app can use it, and the library's semantic color classes (`bg-primary`) paint nothing because the theme resets them (ADR 0003). The intermediate is where that adaptation lives.
