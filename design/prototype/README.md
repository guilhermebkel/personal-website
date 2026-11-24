# Prototype boards

Reference only. These are the approved prototype boards, copied byte for byte from the claude.ai artifact that holds them (the artifact is the source of truth for the look of the site; see `design/system/DESIGN.md`). Nothing in the site imports from this folder.

- Artifact: https://claude.ai/artifact/9qHgTkwLiLwjEFizMYcTK5 (slug `47871702-7f38-4b13-bdb6-d054fdfc6d68`), files `project/*.dc.html` and `project/canvas.json`.
- `canvas.json` lists each board's title and size (`w` by `h`, CSS px).
- Do not edit a board here. To change the prototype, change the artifact and copy the board again.

The Design System artifact's `ds/guilherr-me/tokens.json` is an older snapshot and is not copied here; the tokens live in `design/system/tokens.json`.

## Boards

| Board | Title | Size | Route | Captured |
| --- | --- | --- | --- | --- |
| Intro | Seção 1 · Intro (desktop) | 1440×900 | `/` | `#intro` |
| IntroMobile | Seção 1 · Intro (mobile) | 390×844 | `/` | `#intro` |
| Projetos | Seção 2 · Projetos (desktop) | 1440×832 | `/` | `#projects` |
| ProjetosMobile | Seção 2 · Projetos (mobile) | 390×732 | `/` | `#projects` |
| Posts | Seção 3 · Posts (desktop) | 1440×1040 | `/` | `#posts` |
| PostsMobile | Seção 3 · Posts (mobile) | 390×1360 | `/` | `#posts` |
| Citacoes | Seção 4 · Citações (desktop) | 1440×730 | `/` | `#quotes` |
| CitacoesMobile | Seção 4 · Citações (mobile) | 390×640 | `/` | `#quotes` |
| Contato | Seção 5 · Contato (desktop) | 1440×600 | `/` | `#contact` |
| ContatoMobile | Seção 5 · Contato (mobile) | 390×740 | `/` | `#contact` |
| Blog | Blog · Listagem (desktop) | 1440×1500 | `/blog/` | `main` |
| BlogMobile | Blog · Listagem (mobile) | 390×1620 | `/blog/` | `main` |
| Post | Blog · Post (desktop) | 1440×3230 | `/blog/how-to-install-rancher-inside-aws-eks/` | `main` |
| PostMobile | Blog · Post (mobile) | 390×3030 | `/blog/how-to-install-rancher-inside-aws-eks/` | `main` |
| Assinatura | Assinatura no fim do post | 1280×560 | `/blog/how-to-install-rancher-inside-aws-eks/` | the "Written by" block |
| MenuMobile | Menu mobile aberto | 390×844 | `/` | viewport, menu open |
| NotFound | 404 (desktop) | 1440×740 | `/404/` | `main` |
| NotFoundMobile | 404 (mobile) | 390×700 | `/404/` | `main` |
| LogoRound | Logo: versão final (cantos suaves) | 1440×700 | none | reference only |
| Curvas | Hoje × proposta: formas e linhas curvas | 1280×820 | none | reference only |

The mapping above is the one in `scripts/prototype-boards.mjs`; change both together.

## Commands

- `pnpm prototype:shots [<Board> ...]` writes `test-results/prototype/<Board>.png` at each board's size, with the animations frozen at their end state and the fonts loaded. With no argument, every board.
- `pnpm prototype:compare [<route> ...]` needs `out/` (run `pnpm build` first). It serves `out/`, captures each mapped route at the board's size with reduced motion, and writes `test-results/prototype/<Board>.site.png` and `<Board>.compare.png` (the prototype on the left, the site on the right). With no argument, every mapped route.

Those PNGs are generated and gitignored; never commit them.
