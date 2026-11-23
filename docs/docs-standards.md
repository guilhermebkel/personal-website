# Docs standards

What goes in `docs/` and where everything else goes.

## Two kinds of file, and product docs apart

- **Standard.** A rule that applies to every file or screen of its kind. Each rule is one line a reviewer or a tool can answer yes or no, tagged with how it is checked. The file is `docs/<topic>-standards.md`. Harness changes follow `docs/harness-standards.md`.
- **Guide.** How to do a recurring job (checking a screen in the browser, adding a shadcn control, writing a post). A guide is listed in the table below.
- **Product doc.** What the site does or how a part of it is operated. It lives in `docs/product/`, never beside the standards, so it is not read as one.

`docs/adr/` keeps its own rules and is not classified here. `docs/agents/` holds the issue and triage setup the agent reads (`issue-tracker.md`, `triage-labels.md`, `domain.md`); it is not classified here either.

| File | Kind |
| --- | --- |
| `docs/adding-shadcn-components.md` | guide |
| `docs/content.md` | guide |
| `docs/visual-check.md` | guide |

## What a standard never contains

- A component, route, constant, screen or piece of copy as the rule. An example may name one, as an example: inside a fenced block, or on a line that says "e.g." or "example".
- A description of the product. The product and its terms are in `GLOSSARY.md`.

Test for a new line: **would it stay true if the screen, component or copy it mentions were renamed or deleted?** If not, it does not go in a standard.

## Where the other content goes

- What the product does, and its terms: `GLOSSARY.md`.
- Why a choice was made: `docs/adr/`.
- How one feature or screen behaves: the code and its tests; if it needs prose, a note in `docs/product/`.
- Tokens, such as colors, type sizes and radii: `design/system/tokens.json`, which already holds them.
- A rule a tool can check is a tool (`docs/code-standards.md`); the standard then says which tool and keeps the line.
