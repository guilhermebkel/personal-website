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
