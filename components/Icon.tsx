import { ArrowUpRight, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export type IconName = "external";

const STROKE_WIDTH = 1.75;

// Why: every name maps to one named import, so the bundle holds only the icons used, and a name missing from this map fails the compiler.
const ICON_NAME_TO_COMPONENT: Record<IconName, ComponentType<LucideProps>> = {
  external: ArrowUpRight,
};

type IconProps = {
  name: IconName;
  className?: string;
};

export const Icon = ({ name, className }: IconProps) => {
  const Component = ICON_NAME_TO_COMPONENT[name];
  return <Component className={["size-4 shrink-0", className ?? ""].join(" ")} strokeWidth={STROKE_WIDTH} aria-hidden="true" />;
};
