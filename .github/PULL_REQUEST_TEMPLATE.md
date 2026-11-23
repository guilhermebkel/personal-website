## What and why

<!-- One or two sentences. -->

## How I tested it

<!-- `pnpm check:changed` is the minimum; CI runs the full `pnpm check`. Add the preview URL of the branch and what you tried there. -->

- [ ] `pnpm check:changed` passes
- [ ] New behavior has a test next to the file it tests
- [ ] New e2e test: it is tagged, and no lower level could prove the same

## Checklist

- [ ] No secrets or private data anywhere in the diff
- [ ] A new runtime dependency has its reason in this description; `pnpm-lock.yaml` changed only with `package.json`
- [ ] `GLOSSARY.md`, the docs or an ADR updated if behavior or vocabulary changed
- [ ] Screen changes follow `docs/ui-ux-standards.md` and `docs/copy-standards.md`
- [ ] Screen changes use tokens only and follow `design/system/DESIGN.md` (tokens changed in `tokens.json`, `pnpm design:tokens` run)
- [ ] Screen changes were checked in the browser as `docs/visual-check.md` describes and compared with the prototype
- [ ] A post from the AI pipeline is merged only by the owner
