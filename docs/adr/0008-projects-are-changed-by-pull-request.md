# Projects are changed by pull request, not written by a cron

ADR 0001 planned a cron that reads GitHub and writes `content/projects/`. The owner wants to choose which repositories show, in which order, with which cover and tags, and a cron cannot choose. A repository with a good README is not always a project the owner wants to show, and a cover or a type is a decision, not data GitHub has.

## Decision

- `content/projects/<name>.json` is edited like any other content: a pull request that adds, removes or changes files (and the cover under `public/projects/`). `ProjectSchema` checks them at build.
- Fields: `kind`, `tags`, optional `cover` and `order`, besides name, description, URL and `updatedAt`. `docs/content.md` has the table.
- The owner can do it by hand or through the Claude skill `gerenciar-projetos-do-site-pessoal`, which lists the public repositories created this year that are not on the site, proposes the missing fields, checks the rendered page and opens the pull request. The skill merges only after the owner says so.
- There is no projects cron, no `GITHUB_TOKEN` in the build and no scheduled workflow for it.

## Cost

A new repository does not appear by itself: someone has to ask. In return the Projects section is chosen, ordered and reviewed as a diff, and the build needs no secret.
