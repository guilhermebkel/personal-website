# design/system

Token source, generated theme and rules of the guilherr.me design system. How it works, how to regenerate it and how to turn it on: `DESIGN.md`.

## Components

Each one lives in `components/` (the intermediate the app imports). A control built on shadcn/ui has its library file in `components/ui/`, used only through the intermediate.

| Component | What it is |
| --- | --- |
| `Button` | The control: `primary`, `outline`, `ghost` and `link` variants; `asChild` turns a link into a button |
| `SiteHeader` | Top bar with the site name and the main links |

Add a row here when a component is added (decide it in the artifact first).
