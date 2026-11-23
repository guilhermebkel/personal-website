import NextLink from "next/link";
import type { ComponentProps } from "react";
import { Icon } from "@components/Icon.tsx";
import { LINK_CLASS } from "@styles/LinkClasses.ts";
import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";

type LinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  // Why: a link that leaves the site carries the arrow (docs/ui-ux-standards.md); a bare icon link names its target another way and turns it off.
  hasExternalIcon?: boolean;
};

const WEB_ADDRESS = /^https?:\/\//u;

export const Link = ({ href, className, target, children, hasExternalIcon = true, ...props }: LinkProps) => {
  const classes = ClassNameUtil.merge(LINK_CLASS, className);
  if (href.startsWith("/")) {
    return (
      <NextLink href={href} className={classes} {...props}>
        {children}
      </NextLink>
    );
  }
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;
  const showsArrow = hasExternalIcon && WEB_ADDRESS.test(href);
  return (
    <a href={href} target={target} rel={rel} className={classes} {...props}>
      {children}
      {showsArrow ? <Icon name="external" /> : null}
    </a>
  );
};
