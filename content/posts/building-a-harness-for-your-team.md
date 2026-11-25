---
title: Team Harness That Ships Faster and Keeps Quality
date: 2026-11-25
summary: "Lessons from building AI harnesses for a team: start from the process, the pieces that matter, how it improves itself and why it lets cheaper models do the work."
tags: [ai, harness, claude-code, agents, developer-productivity]
cover: /covers/building-a-harness-for-your-team.svg
---

Imagine hiring the most brilliant developer you have ever met, with one catch: every morning they forget everything about your company. They write great code, but they do not know your folder layout, your naming rules or what your team means by "instance". That is what working with an AI model looks like, and a harness is what you hand that developer every morning.

With a good harness, the AI works the way your team works, so the quality of the result stops depending on who wrote the prompt (and, as a bonus, much cheaper models start doing the job well).

The common approach is the opposite: each developer keeps their own prompts and tricks, and every new problem gets one more sentence in a long instructions file. That fails because the model forgets what it was told in the last chat, and a rule written only in prose is the first one it ignores.

This year I built harnesses for my personal projects and for the development team at the company where I work, and this post is what I learned doing it. It is not a step-by-step tutorial, but a set of lessons you can use to build your own.

We will go in six parts. First we see what a harness is, then why it must start from the process you already follow, then the pieces that matter and the scripts worth writing, then how to make the harness improve itself, and in the end how to fit it to your context and your budget.

## What a Harness Is

A harness is everything around the model that makes it work the way your team works: the instructions it reads, the tools it calls, the checks it must pass and the processes it follows. The model brings the intelligence; the harness brings the context it cannot have on its own.

The name fits better than it looks, since a harness is also what you put on a horse. The horse is strong without it, but it pulls the cart wherever it wants (and usually not where you need).

Back to the new hire: each thing you would give a brilliant person on their first day has a matching piece in the harness.

| What a new hire needs                          | The harness piece             |
| ---------------------------------------------- | ----------------------------- |
| A map of the company and where things live     | `AGENTS.md`                   |
| The words the team uses                        | A glossary                    |
| How we do each kind of task                    | Docs, one per situation       |
| Tools that do the boring parts right           | Scripts                       |
| Someone who checks the work                    | Lint, tests and visual checks |
| Checklists for the processes that never change | Skills                        |
| Colleagues for specific jobs                   | Subagents                     |

Keep in mind that the new hire forgets everything every morning. So nothing that lives only in your head, or in last week's chat, exists for them: if it is not in the harness, it is not in the work.

## Starting From the Process

A harness is built from a process you already know, not from a list of AI features. So before writing any file, this part is about finding the manual steps you do today, since each one becomes a piece later.

### Writing Down What You Do by Hand

Think about the last feature you shipped. Usually you studied the problem (the code, the docs, the product), implemented it, and tested it before opening the pull request. That is the whole process, and the pieces of your harness live inside those three steps.

In order to see them, write each step as a short sentence with what you read, what you ran and how you knew it was done. "I read the glossary and the screen's code, I ran the linter and the tests, I compared the screen with the prototype" already names five pieces.

Keep in mind that a harness for a process you do not understand gives you nothing back. If you cannot say how a task is done by hand, the AI will not guess it for you; it will invent a process, and every session will invent a different one.

### Turning Each Step Into a Piece

Now that the steps are on paper, each one points to a piece. Studying becomes docs and a researcher subagent, implementing becomes code standards and scripts, and testing becomes checks the agent runs before it says it is done.

```mermaid alt="The four steps of the process, each with the harness pieces it needs"
flowchart TD
  A[Study] --> B[Implement] --> C[Test] --> D[Review]
  A -.- A1[Glossary<br/>docs<br/>researcher]
  B -.- B1[Code standards<br/>scripts<br/>implementer]
  C -.- C1[Unit and e2e tests<br/>isolated render<br/>tester]
  D -.- D1[check:changed<br/>review gate]
```

The way you split the work matters too. In my own repositories, I use a stronger model (Sonnet) to plan and write GitHub issues, and then I open a new chat with a cheaper one (Haiku 5.5) to execute each issue. The issues are the only place where I manage what must be done in the repository, so every session starts from a written task instead of from my memory.

### Writing Each Task as a Spec

If issues are where the work lives, give them a fixed shape with issue templates (one for a task, one for a bug, one for an idea). The template decides what every task must say before an agent picks it up: the context, the scope as a numbered checklist, the acceptance criteria as `WHEN ... THEN ...`, what the tests must prove and where to look in the code. So the agent always executes, tests and validates in the same way, and the reviewer checks the pull request against the same list.

My personal repositories have these templates, and the AI writes most of the issues itself by following them. Here is the task template of this site.

```yaml title=".github/ISSUE_TEMPLATE/task.yml" collapsed
name: Task (spec for an agent or a person)
description: A piece of work written so that someone can do it from this issue alone, without the conversation that created it.
title: Team Harness That Ships Faster and Keeps Quality
labels: ["task", "needs-triage"]
body:
  - type: markdown
    attributes:
      value: |
        Write it so an agent that only reads this issue can do it. One issue is one pull request. If it needs two, split it.
        **Never paste secrets or private data** (tokens, personal contact details of other people). Use invented data.
  - type: textarea
    id: context
    attributes:
      label: Context
      description: Why this exists and what is true today. Link the ADR or the prototype board that explains it.
    validations:
      required: true
  - type: textarea
    id: scope
    attributes:
      label: Scope
      description: A numbered checklist in the order it should be done. Each item can be checked by someone else. Say what to build, not which methods to write (that goes in Where to look).
      placeholder: |
        - [ ] S1. ...
        - [ ] S2. ...
    validations:
      required: true
  - type: textarea
    id: out-of-scope
    attributes:
      label: Out of scope
      description: What looks related but belongs to another issue (link it).
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
      description: Numbered, one behavior each, written as `WHEN <condition> THEN <observable result>`. Put the edge cases and error cases in the same list, marked `[edge]`. Observable behavior, not tasks.
      placeholder: |
        - **AC1** WHEN ... THEN ...
        - **AC2** [edge] WHEN ... THEN ...
    validations:
      required: true
  - type: textarea
    id: tests
    attributes:
      label: Tests
      description: >-
        What must be proven, by AC number where it helps, with the data or fixtures to use.
        Never the kind of test, a test file or a tool; the agent picks the level
        (docs/test-standards.md, Which level).
        Right - AC4 with prefers-reduced-motion set, no animation runs.
        Wrong - Playwright test for AC4.
    validations:
      required: true
  - type: textarea
    id: where-to-look
    attributes:
      label: Where to look
      description: Files, ADRs, GLOSSARY terms and issues the agent should read first.
  - type: input
    id: blocked-by
    attributes:
      label: Blocked by
      description: Issues that must be closed before this one can start, like `#12, #15`. Write `none` if nothing blocks it.
      placeholder: none
    validations:
      required: true
  - type: textarea
    id: needs-input
    attributes:
      label: Needs input
      description: Decisions, content or access only a person can give. If this has text, the issue is not `ready-for-agent`.
  - type: checkboxes
    id: privacy
    attributes:
      label: Privacy
      options:
        - label: This issue has no secrets or private data.
          required: true
```

## The Pieces

The pieces of a harness are the same in almost every repository I built this year, from this site to MCP servers and an open-source skill. This part goes through each one, in the order the agent meets them in a session.

### AGENTS.md as an Index

`AGENTS.md` is the first file the agent reads, so it must be short and point to the rest instead of holding it. In my repositories it has 60 to 90 lines, and `CLAUDE.md` is a single line (`@AGENTS.md`) so every tool reads the same file.

It always has the same parts: one paragraph saying what the project is, the folder layout, the commands, a table that routes each kind of task, and short rules. The table is the part that does the work, since it tells the agent which doc to read and which command to run for the task in front of it.

Below is the whole `AGENTS.md` of this site. It has 74 lines, and it is a good example of the size to aim for.

```md title="AGENTS.md" collapsed
# guilherr.me (personal-website)

Static personal site of Guilherme Mota: a home in five sections (intro, projects, posts, quotes, contact), a blog and a 404, in one dark theme. It exposes his work; it is not a portfolio storefront. Vocabulary is in `GLOSSARY.md`; decisions are in `docs/adr/`. The harness follows `tocomevidencia` (ADR 0002), cut to what a static site needs.

## Layout

- `app/`: routes, pages and layouts (Next.js App Router, static export to `out/`).
- `components/`: UI components, one per file, or a folder in the composition pattern when it has parts (`index.tsx` root, `use<Name>.ts`, `<Name>Context.ts`, one file per part), named by what they show. `components/ui/` holds shadcn/ui's own files, used only through their intermediate.
- `hooks/`: hooks shared by more than one component. `styles/`: class strings shared by more than one component (ADR 0006).
- `design/`: the design as code (`design/README.md`); `design/system/` has the tokens (`tokens.json`, generated `tokens.css`) and `DESIGN.md`. `design/prototype/` holds the approved prototype boards (`*.dc.html`, `canvas.json`) as reference only; the site imports nothing from it.
- `src/`: logic with no UI. Every file in a mapped folder ends its name with the folder's name, singular (`PostService.ts`). Layers, low to high: `Protocols` (types only) < `Schemas` (Zod) < `Utils` (static helpers) < `Services` (dependencies through the constructor) < `Factories` (wiring) < `app/`.
- `content/posts/`: one Markdown file per post, with front-matter checked by `PostSchema`.
- `content/projects/`: one JSON file per project, changed through pull requests and checked by `ProjectSchema` (`docs/content.md`).
- `e2e/`: Playwright tests. Unit tests sit next to the file they test (`*.test.ts`).
- `scripts/`: harness scripts (`lint`, `check-changed`, `ensure-*`) and their tests.

## Commands

    nvm use
    pnpm ensure-deps   # pnpm install when node_modules is missing or the lockfile changed
    pnpm dev
    pnpm design:tokens # regenerate design/system/tokens.css from tokens.json
    pnpm test
    pnpm visual:component <file> # one component in each state, as PNGs in test-results/visual/
    pnpm prototype:shots [Board ...] # the prototype boards as PNGs in test-results/prototype/
    pnpm prototype:compare [route ...] # after pnpm build: prototype beside site, PNGs in test-results/prototype/
    pnpm test:changed  # tests related to files changed against origin/main
    pnpm typecheck
    pnpm format        # Prettier with the Tailwind plugin, writes every file
    pnpm format:check  # the same check without writing; `pnpm lint` runs it first
    pnpm lint          # format:check, then Oxlint and a minimal ESLint, in parallel
    pnpm lint:fix      # format, then the linters' fixes
    pnpm quality       # knip, jscpd, dpdm
    pnpm build         # static export to out/
    pnpm check:changed # what the branch changed against origin/main
    pnpm check         # everything; CI runs it split in parallel jobs

## How to act on a task

| When                                          | Read                                                                               | Run                            |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| Starting a session                            | `README.md` (Development)                                                          | `nvm use`, `pnpm ensure-deps`  |
| Given a GitHub issue number                   | `docs/agents/issue-tracker.md` ("Working an issue")                                | `gh issue view <n> --comments` |
| Triage labels on an issue                     | `docs/agents/triage-labels.md`                                                     | —                              |
| Domain terms or an ADR                        | `docs/agents/domain.md`, `GLOSSARY.md`, `docs/adr/`                                | —                              |
| Writing or changing code                      | `docs/code-standards.md`                                                           | —                              |
| Writing or changing tests                     | `docs/test-standards.md`                                                           | —                              |
| Screen layout or UI behavior                  | `docs/ui-ux-standards.md`                                                          | —                              |
| Tokens, colors or motion                      | `design/system/DESIGN.md`                                                          | `pnpm design:tokens`           |
| Text a visitor reads                          | `docs/copy-standards.md`                                                           | —                              |
| Adding a shadcn control                       | `docs/adding-shadcn-components.md`                                                 | —                              |
| Change visible on screen                      | `docs/visual-check.md`                                                             | `pnpm build`, `pnpm test:e2e`  |
| Writing a post or changing the content format | `docs/content.md`                                                                  | `pnpm test`                    |
| Writing or moving docs under `docs/`          | `docs/docs-standards.md`                                                           | —                              |
| Before committing                             | `docs/code-standards.md` ("Before committing"), `.github/PULL_REQUEST_TEMPLATE.md` | `pnpm check:changed`           |
| Full verification (CI gate)                   | `.github/PULL_REQUEST_TEMPLATE.md`                                                 | `pnpm check`                   |
| SEO, metadata or a site file                  | `docs/seo-standards.md`                                                            | `pnpm build`, `pnpm check:seo` |
| Changing the harness                          | `docs/harness-standards.md`                                                        | `pnpm check:changed`           |
| A decision with a cost                        | `docs/adr/`                                                                        | —                              |

## Rules

- Commit once per task, after a clean `pnpm check:changed`; CI runs the full `pnpm check` as the gate. Never raise a limit or add an ignore to pass.
- Start new work on a branch from `main` and open a pull request. Branch names are `<type>/<short-name>` in lowercase kebab-case, where `<type>` is `feat`, `fix` or `chore`; for issue work the name starts with the issue number (`feat/<n>-short-slug`). The pull request body starts with `Closes #<n>`; one pull request closes one issue.
- Code, docs, routes and identifiers are in English. The site text is in English too (the approved prototype); change that only through an ADR.
- No hex color or size outside `design/system/tokens.json`: everything else uses a token (`design/system/DESIGN.md`). Edit `tokens.json`, run `pnpm design:tokens`, commit both files.
- The app imports shadcn controls only through their intermediate in `components/`, never from `components/ui/` (ADR 0004).
- The site is static: no server code at request time, no database, no login. Anything that needs one is a new ADR first.
- Rules that cannot fail (a content schema, who may merge a post) live in code with a test, never only in a doc.
- `process.env` is read only in `EnvUtil`; a new dependency needs a reason in the PR (`docs/code-standards.md`).
- Before exploring an area, read `GLOSSARY.md` and the ADRs that touch it; when your output contradicts an ADR, say so.
- Content is data checked at build: a post or project that fails its schema fails the build.
- Posts written by the AI arrive as pull requests and are merged only by the owner.
- When behavior or vocabulary changes, update `GLOSSARY.md`, the docs or an ADR in the same PR.
```

Notice three things in it. The Commands block has one comment per line, so the agent never guesses what a command does. The table sends each task to one doc and one command. And the Rules are short, since the long rules live in the docs the table points to.

The index never repeats what the docs say. If a rule is needed only when writing tests, it lives in the test doc, and the agent loads it only then.

### A Glossary in Your Team's Words

The glossary is the piece people skip, and it is the one that lets a developer talk to the AI the way they talk to a colleague. Each term has the name the team uses, what it means for the business and where it lives in the code.

At work, the terms keep the names the team says in Portuguese ("Instância", for example), with the meaning and the code location in English. So a developer can write "the instância of this customer" and the agent knows which service and which files that means. In my own repositories, each term also lists the words to avoid, so the agent does not invent a second name for the same thing.

Here is the whole glossary of this site, followed by the short doc that tells the agent when to read it and what to do with a term that is missing.

```md title="GLOSSARY.md" collapsed
# guilherr.me

The personal site of Guilherme Mota.

## Language

**Work**:
Something Guilherme built or wrote and the site exposes: a project or a post.
_Avoid_: portfolio item, case

**Project**:
A GitHub repository shown in the Projects section. Its data is a JSON file in `content/projects/` (name, description, URL, kind, optional cover and order); the card shows the kind as a chip, changed through a pull request.
_Avoid_: repo card

**Post**:
A Markdown file in `content/posts/` shown in the blog. It has front-matter (title, date, summary, tags) and a body.
_Avoid_: article, entry

**Draft post**:
A post written by the AI pipeline and opened as a pull request. It becomes a post only when the owner merges it.

**Content**:
Posts and projects together. It is data, checked by schemas at build.

**Design system**:
The tokens and components approved for the site, kept in the guilherr.me Design System artifact and mirrored in code by `design/system/` (`tokens.json` is the source of the Tailwind theme).
```

```md title="docs/agents/domain.md" collapsed
# Domain docs

Before exploring, read `GLOSSARY.md` and the ADRs in `docs/adr/` that touch the area you're about to work in. If they don't exist, proceed silently.

When your output names a domain concept (issue title, test name, proposal), use the glossary's term. A concept missing from the glossary is either invented language (reconsider) or a real gap (note it).

Text a visitor reads follows `docs/copy-standards.md`. Read it before writing or changing a label, a heading, an error or the tab title.

If your output contradicts an ADR, say so explicitly: _Contradicts ADR-0003 (…), but worth reopening because…_
```

### Docs for Each Situation

Docs hold how each kind of task is done in this repository: code standards, test standards, UI rules, copy, SEO. Since the agent reads them only when the index sends it there, each doc can be as specific as it needs without making every session heavier.

When a topic changes by situation (researching a bug in production is not the same as researching a new feature), it becomes a folder with one file per situation and a small index that routes between them.

### ADRs for the Decisions Behind the Code

Some things the agent needs to know are not rules but decisions: why this database, why diagrams are drawn at build time, why a budget was raised. Without them, the agent sees code that looks odd and "fixes" it, undoing a choice someone made on purpose.

So my personal repositories keep Architecture Decision Records in `docs/adr/`, one short file per decision with the context, the decision and its cost (they go from 7 to 45 files, depending on the project). The domain doc tells the agent to read the ADRs that touch an area before working on it, and to say so explicitly when its change contradicts one, instead of quietly going around it.

Here is the ADR this site got when it started drawing the diagrams you see in this post.

```md title="docs/adr/0010-mermaid-diagrams-rendered-at-build.md" collapsed
# Mermaid diagrams in posts are rendered at build time

A post can draw a diagram with a `mermaid` code block, written in the post itself. The site is static (ADR 0001), so the diagram must be decided before the request: either the browser draws it from the Mermaid source at page load, or the build draws it once and the page shows a picture. The choice is between these two, and the build-time one is the only one that keeps the page free of extra JavaScript.

## Decision

- `scripts/render-diagrams.mjs` runs before `dev` and `build` (npm `pre` scripts). It reads every `mermaid` block of `content/posts/*.md`, draws it with `@mermaid-js/mermaid-cli`, and writes one SVG per block to `public/diagrams/<slug>/<hash>.svg`. The hash is of the block's source, so an edited diagram has a new address and a browser never shows an old picture. The folder is generated and ignored by git.
- The post's Markdown is rewritten before it reaches the renderer (`MermaidUtil.replaceDiagrams` in `PostService.readPost`): each block becomes an image alone in its paragraph, so it is shown as a figure like any other picture (`PostFigure`). The `alt="..."` option of the info string names it; without it the alt is "Diagram".
- The diagram uses Mermaid's `classic` look: the default `neo` look adds a light drop shadow to each shape, which reads as a white halo on the dark ground.
- The diagram is drawn with the site's tokens (`design/system/tokens.json`, `buildMermaidConfig`), on the `cover` token, the ground of a post figure, and in the site's Ubuntu. An SVG shown as a picture cannot load the page's fonts, so the Ubuntu files of `@fontsource/ubuntu` (regular and medium, latin) are embedded in each SVG as `@font-face`. Mermaid drops that rule from its own style sheet, so it is added at the root of the finished SVG (`injectFontCss`). A missing color token fails the build.
- A diagram that does not parse fails the build: the error names the post (`mermaid in post "<slug>": ...`) and the script exits with code 1.
- The browser that draws is the Chromium of Playwright, the same one the end-to-end tests use. It is installed by `pnpm ensure-playwright` only when a post has a diagram, so a build with no diagram neither downloads nor launches a browser.
- Mermaid runs in Node at build time, never on the reader's page. The page loads no script for a diagram.

## Cost

- Build time: one browser launch per run that has a diagram, and one render per diagram. A post with diagrams adds seconds to `pnpm build`; a post without them adds nothing.
- Dependencies: `@mermaid-js/mermaid-cli` (with `mermaid` and `puppeteer-core` under it). Its own Chrome download is blocked by pnpm (build scripts are not allowed), so the script uses the Playwright Chromium instead. A new Mermaid version needs a check of the rendered SVGs.
- Each SVG is about 100 KB, mostly the two embedded font files. It is an image, so it does not count against the script budget (`docs/harness-standards.md`).
- A diagram is not interactive and cannot be zoomed by Mermaid itself; the post's image zoom (`PostImage`) applies to it as to any picture.

## Not decided here

- Other diagram languages (PlantUML, Graphviz) and interactive diagrams stay out of scope (issue #81).
```

### Scripts That Decide Instead of the Model

Scripts are deterministic code the agent runs to validate its own work, and they are the piece that holds quality when you use cheaper models. The rule I follow is "a tool before a sentence": a new standard becomes a type, a lint rule or a script first, and it becomes a line of text only when no tool can check it.

I learned this with a naming rule. The docs said that boolean variables start with "is", and the agent kept forgetting it; adding more emphasis to the sentence changed nothing, while a lint rule fixed it for good. Duplicated code was the same story, since a tool like jscpd finds it in seconds and the model does not.

```json
{
  "path": ["src", "app", "scripts"],
  "minTokens": 50,
  "threshold": 1
}
```

The command that ties them together is `check:changed`, which runs lint, types, tests and these checks only on what the branch changed. The agent runs it before every commit, so it gets the answer in seconds instead of waiting for CI.

Scripts also make the agent faster at finding things, which is where a lot of time and tokens go. At work, `search-code` ranks the files of a repository by the words that describe a feature (BM25, with no index to build), so the agent opens the right files first instead of reading folder after folder. And `search-pull-requests` searches the merged pull requests of every company repository by a term, so the agent can see how a similar feature was built before.

### Tests, Starting With the Cheapest View

The good practices of testing still hold with AI: unit tests next to the file they test, end-to-end tests for the flows that matter, no fixed waits and no retries to hide a flaky test. What changes is how you check a screen.

Opening the whole app to look at one button is slow and spends a lot of tokens. So my harnesses render the component alone, in each state, as one image per state and screen width, and the agent compares it with the prototype print (in this site, `pnpm visual:component <file>`). The full screen is captured only when the answer depends on something outside the component, such as scroll or the page layout.

### Skills for Processes That Never Change

A skill is a written process the agent follows step by step, for tasks that must be done the same way every time. At work I use skills for most of the daily work (implementing a feature, applying review comments, debugging a support bug), since a team needs the same result no matter who asked.

The signal is repetition. If you or your team ask for the same multi-step flow more than twice, it should be a skill, and a doc used only by that skill goes inside its folder.

Below is a whole skill from one of my open-source repositories, [logo-to-ai-loading-icon](https://github.com/guilhermebkel/logo-to-ai-loading-icon). Notice that the `description` says when to use it in the words a person would type, and that each step of the workflow calls a script instead of explaining how to do the work by hand.

```md title="SKILL.md" collapsed
---
name: logo-to-ai-loading-icon
description: Create an animated SVG loading icon (pure CSS, no JavaScript) for AI chat and agent responses from a brand logo, in the style of the "thinking" indicators of AI assistants, with symbols derived from the logo (ring, cross) that move and return to rest. Use whenever the user asks for a loading, spinner, "thinking" or "typing" indicator for an AI chat, assistant or agent, wants to turn a logo into a loader, wants brand shapes moving while a response is generated, or needs a WebP or GIF fallback for such an icon, even if they do not say "SVG".
license: MIT
compatibility: Needs Python 3 with Playwright (Chromium) and Pillow for the measure, render and export scripts (pip install -r requirements.txt, then playwright install chromium). Writing the SVG itself needs nothing else.
metadata:
  version: "0.2.0"
  updated: "2026-10-31"
---

# Logo to AI loading icon

Produces one `.svg` file, animated only with CSS, that works in `<img>`, as a CSS `background` and inline. It is the "AI is working" indicator of a chat or agent UI, built from the user's own logo.

## Principles (they came from real review rounds)

- **Return to rest, then repeat.** Frame 0% and frame 100% are identical, with a short pause at rest. AI assistant indicators animate, settle, and animate again.
- **Continuity beats spectacle.** Prefer movements where pieces change without cuts and the loop closes smoothly.
- **No tile, no text.** Brand color directly on the shapes. When the user wants a symbol, derive shapes from the logo (the ring of an "o", the cross of a "t") and do not show the letters.
- **Pieces never merge.** Pieces cross each other through depth (scale and paint order), never by overlapping at the same position. A cross entering a ring was rejected in review.
- **Show options.** For open requests, generate 3 to 6 variants and render a contact sheet so the user can choose.

## Workflow

1. **Understand the input.** Read `references/logo-input.md`. Measure the logo with `python scripts/measure_logo.py logo.svg --split`. Note the shapes, the color and the suggested viewBox. Ask where the icon will live (size, light or dark background) only if you cannot tell.
2. **Choose a recipe.** Read `references/recipes.md`. Six recipes exist: `hop`, `breathe`, `orbit`, `swap`, `satellites`, `bloom`. The "States" and "Legibility at small sizes" sections map them to waiting states and sizes.
3. **Generate.** `python scripts/generate_symbols.py --recipe bloom --out loader.svg --color "#RRGGBB"`. Match the brand with `--hole-ratio`, `--ring-radius`, `--arm`, `--thickness`. Add `--fit` when the icon is sized by height (inline next to text), `--label` for the accessible name, and generate a second file with a light `--color` for dark backgrounds. `--list` shows the recipes and their cycle durations.
4. **Validate.** `python scripts/validate_svg.py loader.svg` (an ERROR blocks; fix WARN; read INFO).
5. **Look at the frames.** `python scripts/render_frames.py loader.svg --duration <cycle seconds> --sheet sheet.png`, then actually open the sheet and follow `references/verification.md`. For small icons add `--sizes 16,24,32,48`.
6. **Deliver.** Send the `.svg` (and the dark variant). State the cycle length and how to use it (`<img src>`). If the destination cannot show animated SVG (email, some apps), export with `python scripts/export_fallback.py loader.svg --duration <s> --format webp --out loader.webp`.

`assets/examples/` has one generated example per recipe, fit and dark variants, a sample logo to practice measuring, and `chat-bubble.html`, which shows the loader inside light and dark chat bubbles.

## SVG versus animated WebP

SVG with CSS is the default for the web: a few KB, sharp at any size, honors `prefers-reduced-motion`. Use animated WebP only when the destination cannot render animated SVG. GIF is the last resort because its transparency is 1-bit.

## Rules for writing the SVG

- `viewBox` is required; add a `<title>` with a readable name and `role="img"`.
- Animations live in `@keyframes` inside a `<style>` in the SVG itself, with `animation-iteration-count: infinite`.
- Every shape that rotates or scales needs `transform-box: fill-box` together with `transform-origin`.
- Include an `@media (prefers-reduced-motion: reduce)` block that stops the animation at the resting frame.
- Use `animation-timing-function` per interval (ease-in-out for movements, linear only for continuous rotation).
- Brand color as hex; offer a light variant for dark backgrounds. `currentColor` only works for inline SVG, not for `<img>`.

## References

- `references/logo-input.md`: measure and decompose the logo, and map it to generator options.
- `references/recipes.md`: recipe catalog, durations, legibility at small sizes, states, design preferences.
- `references/pitfalls.md`: defects that already happened and how to fix them.
- `references/verification.md`: how to check the animation without watching it in real time.
```

### Subagents for the Right Model

Subagents let each kind of work run on the model that does it best. The main session only talks to the developer, plans and reads reports; a researcher reads the code, an implementer writes it (one per repository), and a tester checks the running behavior.

At work, the main session runs on Sonnet and every subagent on Haiku, including the UI implementer, since it reads images and compares the screen with the prototype. A more expensive model is allowed only with a written reason in the pull request.

Reusing a subagent also saves a lot. For a follow-up on the same task (a fix after a failed test, a review comment on what it just wrote), the main session continues the subagent that did the work instead of starting a new one, so it does not read the whole context again from zero. It starts a new one only when the task changes or when the subagent has used 40% of its context window (400k of its 1M tokens), and then it passes on the paths, decisions and findings, not the old transcript.

### A Review Gate for What Needs a Human

When the AI makes writing code much faster, the bottleneck moves to code review: the team ships pull requests faster than people can read them. If reviewers keep reading every line, you gain speed in one step only to lose it in the next.

A tight harness is what gets you out of this. Since the lint rules, scripts and tests already hold the code standards, reviewers do not need to check names, duplication or style, and can care only about what really needs a human.

That is the idea behind the review gate I built into the PR analyst subagent at work. Besides writing the pull request description, it answers one question: does this change affect application or query performance, or the database structure? A new table, raw SQL, a query inside a loop or heavy work in a request handler flags the pull request for a human, with the file and the excerpt that triggered it; a change that only follows the pattern of its neighbors does not.

Keep in mind that the gate works because the criteria are short and written down. Agree with your team on what really needs a human, and let the harness check the rest.

### Pull Requests as Documentation

The same PR analyst subagent writes a clear description for every pull request: what changed, why the task existed, and what a reviewer who never touched that part of the system needs to know. It reads the diff and the task, so writing this costs nobody any time.

This pays off later, and mostly for the AI itself. When an agent has to change a part of the code, it can find the last pull requests that touched it (from the commit history, or with a search over pull requests by term) and read why the code is the way it is, instead of guessing from the code alone. Documenting has never been this cheap, and the main reader of that documentation is the next agent that works on the same code.

## Scripts Worth Writing

Deterministic scripts are the piece that pays off the most, so this part is a list of ideas taken from the scripts I wrote this year, at work and in my personal projects. The rule behind all of them is simple: if the agent runs the same sequence of commands twice, or a step has a side effect that must not go wrong, it becomes a script and the prompt only calls it.

### Following One Contract

Every script answers `--help`, exits with a code other than 0 when something is wrong, and writes an error that says what to do next. Scripts with side effects (a commit, a database write, a call to another service) also take `--dry-run`, and scripts the agent reads take `--json`.

This contract is what lets a cheap model use a script it never saw: it runs `--help` once, and the output tells it everything it needs.

### Preparing the Environment

These scripts make sure every session starts from a known state, so the agent does not waste the first minutes installing or guessing.

- **Install when needed**: `ensure-deps` runs the install only when `node_modules` is missing or the lockfile changed, and `ensure-playwright` installs the browser only when it is not there.
- **A clean place to work**: a script creates a worktree and a branch from the right base branch of each repository, and another keeps a read-only checkout for research, so research never touches the developer's branch.

### Making E2E Tests Repeatable

End-to-end tests break when the environment changes between runs, so at work most of these scripts exist to put the environment back in the same place every time.

- **Start the apps**: one script starts every app the test needs, checks each one is on the right branch, and turns off the popups that would block the browser.
- **Reset the data**: another drops and recreates the local databases, runs migrations and seeds, and creates the same two test accounts every time.
- **Fake the outside world**: scripts inject a fake inbound message event, as the messaging provider would send it, and open the app in the browser already logged in.
- **Call the API as a user**: a script signs in with a test account and makes one authenticated request, without ever printing or saving the token.
- **Run real code with fake edges**: a lab runs the real chatbot modules against scenarios, with only the external services simulated.

### Checking Only What Changed

Running everything on every change is slow and expensive, so `check-changed` and `test-changed` run lint, types and tests only on what the branch changed. In this site, `affected-specs` goes further and picks the end-to-end specs that cover the changed files, and the check falls back to the full run when a shared file changed.

### Catching What the Model Forgets

These are the checks that hold quality when the model is cheap, since each one replaces a sentence the agent would eventually ignore.

- **Local lint rules**: naming, comment format, layer imports, no fixed waits in tests, each rule with a failing example in its test.
- **Duplicated and dead code**: jscpd for duplication, and knip for files and exports nobody uses.
- **The forgotten registration**: a script fails when a new module was created but not added to the central file that registers every module.
- **Docs that drift from code**: in my MCP servers, a check fails when the README or `AGENTS.md` mention a tool that the code does not have, and another fails when a method of the vendor SDK is not classified.
- **The built site**: broken links, SEO tags, a JavaScript size budget, color contrast and Lighthouse scores, all on the static output.

### Looking at Screens and Prototypes

Screens are where models waste the most tokens, so these scripts give the agent the smallest picture that answers the question. `render-component` draws one component in each state; `prototype:shots` turns each prototype board into an image, and `prototype:compare` puts the board beside the built page. At work, another script saves the prototype prints in one size and format, so every implementer compares against the same images.

### Finding Information

These scripts answer "where is this?" faster than the agent reading folders. Besides `search-code` and `search-pull-requests`, there is a script that reads the types of the company's UI library from the installed package (live data, never a copied doc that gets old), one that queries the production database through a read-only user, and one that lists the review comments still open on a pull request.

### Doing Side Effects the Same Way

Commits, pull requests and anything that leaves the machine go through a script, so they happen the same way no matter which model runs them. At work that means one script to commit, one to create or update the pull request, and a pair to split a large pull request in slices and prove the split lost nothing, by applying every slice and comparing the result with the original byte for byte.

In my open-source packages, the same idea covers releases: a smoke test starts the built package and checks its replies, and other checks make sure the package holds only what it should and every dependency has an allowed license.

## Making It Improve Itself

A harness gets better only when every failure of the agent turns into a change in the harness, instead of a correction you type again in the next chat. This part shows how to sort those failures, how to collect them without reading every session yourself, and which tool can do the counting.

### Sorting Every Failure Into a Class

When the agent does something wrong, the question is not "how do I say it louder?" but "which piece failed?". Most of my repositories have a `harness-standards.md` with the same table, and each finding fits exactly one class.

| Class               | When                                                                 | Fix                                    |
| ------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| Rule ignored        | The harness already says it and the agent does the opposite          | A check, never more text               |
| Partial or outdated | The rule exists but is incomplete or false today                     | Fix the line where it lives            |
| Missing             | Nothing covers the case                                              | Add it to the piece that does the work |
| Structure change    | A request repeats, a sequence is rediscovered, a piece is never used | A skill, a script, or remove the piece |
| Out of scope        | The cause is outside the harness                                     | A recommendation only                  |

The first row is the one that saves the most time. If the agent ignores a rule that is already written, writing it again in bold will not help; a hook, a lint rule or a script will.

```mermaid alt="The improvement loop: each failure is classified and its fix goes back into the harness"
flowchart TD
  R[Weekly routine<br/>harness-ledger] -.-> F
  S[Sessions] --> F[Failures]
  F --> K{Which class?}
  K --> X[Ignored:<br/>a check]
  K --> Y[Outdated:<br/>fix the line]
  K --> Z[Missing:<br/>add to the piece]
  K --> W[Structure:<br/>skill, script<br/>or removal]
  X & Y & Z & W --> H[Harness]
  H --> S
```

Every finding goes through this table, and the doc around it also says where a new rule should live first (a type, then a lint rule, then a script, and only then a sentence). Here is that part of the `harness-standards.md` of this site.

```md title="docs/harness-standards.md" collapsed
# Harness standards

The harness is `AGENTS.md`, the standards docs, lint rules, check scripts, `package.json` commands and the pull request template. It was copied from `tocomevidencia` and cut to what a static site needs (ADR 0002).

**A tool before a sentence (review).** A new pattern is enforced by a type, a lint rule or a script first; it becomes a line of text only when no tool can express it.

- **Placement order (review).** Take the first that can express the rule: a type or compiler option; a lint rule; a script or test that `pnpm check` runs; a template or checklist; a line in `AGENTS.md` or a standards doc marked **(review)**; an ADR when it is a decision with a cost.
- **Cheapest adequate fix (review).** Delete or tighten before adding. Rarely needed detail stays out of `AGENTS.md`.
- **Conflict is a finding (review).** Two rules for the same thing are fixed by keeping the one where the work is done; a piece that works only because another says something specific is coupling, and also a finding.

## Classes and where the fix goes

Each finding is exactly one class; the class picks the fix.

| Class               | When                                                                                                                                                                         | Fix                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Rule ignored        | The harness already says it and the agent still does the opposite                                                                                                            | A check; never more text                                                                       |
| Partial or outdated | The rule exists but is incomplete, ambiguous or false today                                                                                                                  | Fix the line where it lives                                                                    |
| Missing             | Nothing covers it                                                                                                                                                            | Add it in the piece that does the work, not in `AGENTS.md`, unless it applies to every session |
| Structure change    | A request repeats (a skill), a fixed sequence is rediscovered (a script), a piece is never used (remove it), a large always-loaded piece is needed only sometimes (split it) | Change the structure, not a longer rule                                                        |
| Out of scope        | The cause is outside the harness                                                                                                                                             | A recommendation only                                                                          |
```

### Reviewing the Sessions Every Week

You can use the AI itself to review the harness, since it reads a week of sessions faster than you read one. At work, a scheduled routine runs every Monday, reads the last 7 days of subagent logs, finds the gaps in the docs, prompts and skills, and opens a real pull request with the fix.

One rule keeps it honest: every edit must trace back to a concrete pattern in the logs. Without it, the routine starts "improving" things nobody had a problem with, and the harness grows instead of getting better.

### Letting a Tool Do the Counting

In order to do the same in any repository, I built [harness-ledger](https://harnessledger.guilherr.me/), an open-source skill for Claude Code, Codex, Cursor and Antigravity. It reads the session transcripts your agent already saves, maps the pieces of your harness, suggests fixes with their cost and checks whether a fix worked.

Its findings use the same classes as the table above, and they come with a frequency ("11 times in 6 of 41 sessions"), so one bad session is not treated as a habit. The numbers come from a script, and the model only classifies them, which is the same idea of scripts that decide instead of the model.

## Fitting It to Your Context and Your Budget

The pieces above are the same everywhere, but the way you deliver them depends on how your company is organized. This part shows what the AI tool already gives you, how I adapted the pieces at work, why a good harness lets you pay less for the models, and how long all of this really takes.

### Starting From the Tool's Own Harness

Your harness is never built from zero, since the AI tool you use already comes with one. Claude Code, for example, already plans before it changes code, keeps a task list while it works, runs subagents, and loads skills and hooks, so a lot of the structure is there before you write your first `AGENTS.md`.

In my opinion, that built-in harness is very good, and it is a big reason I use Claude Code: what I customize sits on top of it instead of replacing it. So when you pick a tool, look at what it already does for planning, tasks and delegation, since everything it lacks becomes a piece you have to build and maintain yourself.

### One Harness for Many Repositories

A single repository can keep its harness inside it, like this site does. A company with dozens of repositories cannot copy the same files into each one, and moving everything to a monorepo only for the AI is a bad trade.

So at work I built a harness toolkit, a pluggable harness: every rule, skill, agent, script and setting lives in one repository, and it works on top of the company's repository folders. Each developer has a clone of it in the workspace, and when a session starts it updates the clone and copies the pieces into the workspace, including one prompt per repository with its architecture and commands. Since that file is ignored by git in each product repository, nothing changes there, and a merge into the toolkit reaches every developer on their next session.

```mermaid alt="A harness repository cloned into the workspace and copied into each repository"
flowchart TD
  T[Harness repository] -->|clone| A[workspace/.agent]
  A -->|copied on every<br/>session start| C[workspace/.claude<br/>skills, agents,<br/>scripts, docs]
  A -->|one prompt<br/>per repository| R1[repo-a/.claude/<br/>CLAUDE.md]
  A --> R2[repo-b/.claude/<br/>CLAUDE.md]
```

Your context may be different (one big repository, a few services, no Claude Code at all), and that is fine. The point is to deliver the same pieces in the way your team already works, not to copy my folders.

### Using Cheaper Models in a Good Harness

The better the harness, the cheaper the model that can do the work, since the docs, scripts and checks carry most of what the model would otherwise have to figure out. At work, Sonnet plans in the main session and Haiku 5.5 does every execution, even complex tasks, with very good results.

When we hit the Claude usage limit, a small proxy in the toolkit routes the requests to other providers: GLM-5.3 for planning and DeepSeek V4.1 Flash for execution, and both work very well. They have a 1M-token context window, like the Claude models, but keep in mind that GLM does not handle images, so anything that depends on a screenshot goes to DeepSeek. The proxy also never sends the developer's Claude credentials to another provider, since each route uses its own key.

```mermaid alt="Model routing: Sonnet plans and Haiku executes, and GLM and DeepSeek take over at the Claude limit"
flowchart TD
  subgraph N[Normal]
    direction LR
    P1[Plan: Sonnet] --> E1[Execute: Haiku 5.5]
  end
  subgraph L[Claude limit reached]
    direction LR
    P2[Plan: GLM-5.3] --> E2[Execute:<br/>DeepSeek V4.1 Flash]
  end
  N -->|proxy routes on<br/>a limit error| L
```

### Expecting the 80/20

You will optimize your harness forever, and that is expected. On day 0, about 20% of the effort gives you 80% of the harness; the last 20%, the adjustments that make it efficient, fast and cheap, take the other 80% of the effort.

In my case, the first version of that harness toolkit took about one week. Then I spent about three weeks learning with my personal projects, and two more weeks applying what I learned at work, in one large pull request that changed the structure into what this post describes. So do not wait for the perfect harness before using it, since the sessions are what show you what is missing.

## Where to Go Next

Congratulations, you now have a map of what a harness needs and the order to build it in. The next step is small: this week, write down the process you follow to ship a feature, and turn it into the "How to act on a task" table of your `AGENTS.md`.

Then use it for real work, one issue per session. After a few weeks of sessions, run [harness-ledger](https://harnessledger.guilherr.me/) on them and fix the findings it shows, starting with the rules the agent keeps ignoring.

## References

The public repositories where I built a harness this year, all with the same skeleton described above:

- [personal-website](https://github.com/guilhermebkel/personal-website): this site
- [harness-ledger](https://github.com/guilhermebkel/harness-ledger)
- [better-investment-mcp](https://github.com/guilhermebkel/better-investment-mcp)
- [better-caprover-mcp](https://github.com/guilhermebkel/better-caprover-mcp)
- [antigravity-connector](https://github.com/guilhermebkel/antigravity-connector)
- [scenec](https://github.com/guilhermebkel/scenec)
- [ultimate-nostalgia-online](https://github.com/guilhermebkel/ultimate-nostalgia-online)
- [gbkel-redirects](https://github.com/guilhermebkel/gbkel-redirects)
- [logo-to-ai-loading-icon](https://github.com/guilhermebkel/logo-to-ai-loading-icon)
- [jscpd](https://github.com/kucherenko/jscpd), the duplicated code detector
