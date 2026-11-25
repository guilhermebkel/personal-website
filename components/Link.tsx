import NextLink from "next/link";
import type { ComponentProps } from "react";
import { Icon } from "@components/Icon.tsx";
import { LINK_CLASS, LINK_PLAIN_CLASS } from "@styles/LinkClasses.ts";
import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";

type LinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  hasExternalIcon?: boolean;
  plain?: boolean;
};

const WEB_ADDRESS = /^https?:\/\//u;

const getRel = (linkTarget: string | undefined) => {
  // Why: only a link that opens a new tab needs the rel that stops the new page reaching back to this one.
  if (linkTarget === "_blank") {
    return "noopener noreferrer";
  }
  return undefined;
};

export const Link = ({
  href,
  className,
  target,
  children,
  hasExternalIcon = true,
  plain = false,
  ...props
}: LinkProps) => {
  // Why: a link that leaves the site carries the arrow (docs/ui-ux-standards.md); a bare icon link names its target another way and turns it off.
  // Why: a link in running text keeps its underline from the prose and drops the hover band, so the reader sees a plain link.
  const classes = ClassNameUtil.merge(plain ? LINK_PLAIN_CLASS : LINK_CLASS, className);
  // Why: a link that opens a new tab is a plain anchor, because Next's link always stays in this tab.
  if (href.startsWith("/") && target === undefined) {
    return (
      <NextLink href={href} className={classes} {...props}>
        {children}
      </NextLink>
    );
  }
  const rel = getRel(target);
  const showsArrow = hasExternalIcon && WEB_ADDRESS.test(href);
  return (
    <a href={href} target={target} rel={rel} className={classes} {...props}>
      {children}
      {showsArrow ? <Icon name="external" /> : null}
    </a>
  );
};
