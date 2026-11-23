# design/system

Token source, generated theme and rules of the guilherr.me design system. How it works, how to regenerate it and how to turn it on: `DESIGN.md`.

## Components

Each one lives in `components/` (the intermediate the app imports). A control built on shadcn/ui has its library file in `components/ui/`, used only through the intermediate.

| Component | What it is |
| --- | --- |
| `Button` | `primary` (purple-light outline, fill sweeps in) and `secondary` (quiet filled pill) |
| `Link` | Text link with the purple band that sweeps in on hover (768px and up) |
| `IconButton` | Round icon-only button (menu, close); needs a label |
| `Navbar` | Fixed bar: logo, Projects, Posts, About; panel after scroll; numbered white menu on a phone |
| `Footer` | Deep ground band: logo, © 2026, Back to top |
| `SectionTitle` | Mono eyebrow ("01 — Projects") and the 56/64 title, with one optional action |
| `Spotlight` | Purple band drawn under a word (the home name, a quote phrase) |
| `SocialBar` | Pill of brand icons (or bare, on the mobile menu) |
| `ContactLink` | Wide pill: brand icon, name, arrow |
| `ProjectCarousel` / `ProjectCard` | Scrolling cards with arrows; card has cover, `P/01`, name, tags, host and Open |
| `PostRow` | A post on the home: cover, text, round arrow |
| `PostBrowser` | The blog list: order select, grid/list toggle and "See more" (6 at a time) |
| `PostCard` | A post in the blog grid: cover, `PostInfo`; the whole card is one link |
| `PostInfo` / `Tag` | Date, reading time, title, summary and tags (`post` outlined, `project` filled) |
| `PostContent` / `PostToc` / `PostSummaryBox` / `PostSignature` | The post page: prose, "On this page", summary box and the "Written by" signature |
| `QuoteCarousel` | Four quotes with numbered counters; the active bar fills in 4 seconds and moves on |
| `Cover` | Tonal cover with the brand rings until posts and projects have images |
| `ContoursIcon` | Page background: a generated tile of terrain lines repeated as an SVG pattern (any page height); the home adds the `hero-glow` |
| `Reveal` | Entrance of a block (rise 18px + fade), played once when seen; `delay` staggers a group |
| `ReadingProgress` | Thin purple bar at the top edge that follows the scroll; rendered by the `Navbar` on a post only |

There is no preloader and no comments (decided; ADR 0001 rules out a comments service).

Add a row here when a component is added (decide it in the artifact first).
