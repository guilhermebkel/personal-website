export type ButtonVariant = "primary" | "outline" | "ghost" | "link";

// Why: the library button sets its own size, colors and focus; the variant below is the whole look, written with design-system tokens only.
const BUTTON_BASE = [
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 font-medium",
  "text-small transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const BUTTON_VARIANT_TO_CLASS: Record<ButtonVariant, string> = {
  primary: `${BUTTON_BASE} bg-purple text-text hover:bg-purple-light`,
  outline: `${BUTTON_BASE} border border-border-strong bg-surface text-text hover:bg-sunken`,
  ghost: `${BUTTON_BASE} bg-transparent text-text-soft hover:bg-surface hover:text-text`,
  link: `${BUTTON_BASE} h-auto px-0 text-purple-light underline-offset-4 hover:underline`,
};
