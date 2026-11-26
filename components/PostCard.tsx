import NextLink from "next/link";
import { Cover } from "@components/Cover.tsx";
import { PostInfo } from "@components/PostInfo.tsx";

type PostCardProps = {
  href: string;
  date: string;
  readingMinutes: number;
  title: string;
  summary: string;
  tags: string[];
  cover?: string;
};

export const PostCard = ({ href, cover, ...info }: PostCardProps) => (
  <NextLink
    href={href}
    className="group/card duration-hover -m-4 flex min-w-0 flex-col gap-4 rounded-lg p-4 text-text no-underline transition-colors md:hover:bg-raised"
  >
    <Cover seed={href} image={cover} className="h-50 rounded-md border-2 border-sunken max-md:h-37.5" />
    <PostInfo {...info} headingLevel="h2" />
  </NextLink>
);
