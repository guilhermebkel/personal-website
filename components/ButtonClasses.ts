export type ButtonVariant = "primary" | "secondary";

// Why: the design system has one button, the main action (at most one per screen): a pill outlined in light purple whose fill sweeps in from the left with scaleX. The library button sets its own size, colors and focus, so this variant is the whole look.
const BUTTON_PRIMARY = [
  "relative isolate inline-flex h-11 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-pill border-2 border-purple-light",
  "bg-transparent px-6 text-body font-medium text-text no-underline transition-colors duration-250",
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-purple before:transition-transform before:duration-250",
  "hover:before:scale-x-100 active:text-graphite active:transition-none active:before:scale-x-100 active:before:bg-pressed active:before:transition-none",
  "focus-visible:outline-offset-4",
  "disabled:cursor-default disabled:border-text-disabled disabled:text-text-disabled disabled:hover:before:scale-x-0",
  "aria-busy:pointer-events-none aria-busy:text-transparent aria-busy:after:absolute aria-busy:after:left-1/2 aria-busy:after:top-1/2",
  "aria-busy:after:size-4 aria-busy:after:-translate-1/2 aria-busy:after:animate-spin aria-busy:after:rounded-full",
  "aria-busy:after:border-2 aria-busy:after:border-text aria-busy:after:border-r-transparent",
].join(" ");

// Why: the prototype's quiet pill (the second action next to the main one): a filled control with a strong border, no sweep.
const BUTTON_SECONDARY = [
  "inline-flex h-11 items-center justify-center gap-2.5 whitespace-nowrap rounded-pill border-2 border-border-strong bg-control px-5",
  "text-body text-text-soft no-underline transition-colors duration-250 md:hover:border-purple-light md:hover:text-text",
  "disabled:cursor-default disabled:border-text-disabled disabled:text-text-disabled",
].join(" ");

export const BUTTON_VARIANT_TO_CLASS: Record<ButtonVariant, string> = {
  primary: BUTTON_PRIMARY,
  secondary: BUTTON_SECONDARY,
};
