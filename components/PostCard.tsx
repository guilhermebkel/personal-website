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
};

export const PostCard = ({ href, ...info }: PostCardProps) => (
  <NextLink
    href={href}
    className="group/card -m-4 flex min-w-0 flex-col gap-4 rounded-lg p-4 text-text no-underline transition-colors duration-250 md:hover:bg-raised"
  >
    <Cover className="h-50 rounded-md" />
    <PostInfo {...info} headingLevel="h2" />
  </NextLink>
);
