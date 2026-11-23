import NextLink from "next/link";
import { Cover } from "@components/Cover.tsx";
import { Icon } from "@components/Icon.tsx";
import { PostInfo } from "@components/PostInfo.tsx";

type PostRowProps = {
  href: string;
  date: string;
  readingMinutes: number;
  title: string;
  summary: string;
};

// Why: the home lists the latest posts as rows (cover, text, a round arrow); the blog page uses cards.
export const PostRow = ({ href, ...info }: PostRowProps) => (
  <NextLink
    href={href}
    className={[
      "group/card -mx-6 flex items-center gap-8 rounded-lg px-6 py-7 text-text no-underline transition-colors duration-250 md:hover:bg-raised",
      "max-md:mx-0 max-md:flex-col max-md:items-start max-md:px-0",
    ].join(" ")}
  >
    <Cover className="h-31.5 w-56 flex-none rounded-md max-md:h-40 max-md:w-full" />
    <div className="min-w-0 flex-1">
      <PostInfo {...info} headingLevel="h3" />
    </div>
    <span
      aria-hidden="true"
      className={[
        "flex size-12 flex-none items-center justify-center rounded-full border-2 border-purple-light transition-colors duration-250",
        "group-hover/card:border-purple group-hover/card:bg-purple max-md:hidden",
      ].join(" ")}
    >
      <Icon
        name="external"
        className="size-5 transition-transform duration-250 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
      />
    </span>
  </NextLink>
);
