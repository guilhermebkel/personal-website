import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
  List,
  Mail,
  Menu,
  MessageCircle,
  Quote,
  X,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";

export type IconName =
  "external" | "mail" | "menu" | "close" | "quote" | "message" | "up" | "left" | "right" | "chevron" | "grid" | "list";

const STROKE_WIDTH = 1.75;

// Why: every name maps to one named import, so the bundle holds only the icons used, and a name missing from this map fails the compiler.
const ICON_NAME_TO_COMPONENT: Record<IconName, ComponentType<LucideProps>> = {
  external: ArrowUpRight,
  mail: Mail,
  menu: Menu,
  close: X,
  quote: Quote,
  message: MessageCircle,
  up: ArrowUp,
  left: ArrowLeft,
  right: ArrowRight,
  chevron: ChevronDown,
  grid: LayoutGrid,
  list: List,
};

type IconProps = {
  name: IconName;
  className?: string;
};

export const Icon = ({ name, className }: IconProps) => {
  const Component = ICON_NAME_TO_COMPONENT[name];
  return (
    <Component
      className={ClassNameUtil.merge("size-4 shrink-0", className)}
      strokeWidth={STROKE_WIDTH}
      aria-hidden="true"
    />
  );
};
