import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HeadingSlugUtil } from "@/Utils/HeadingSlugUtil.ts";

const PROSE_CLASS = [
  "w-full max-w-180 text-text-soft",
  "[&_p]:mb-6 [&_p]:text-prose",
  "[&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:scroll-mt-24 [&_h2]:text-subheading [&_h2]:font-medium [&_h2]:tracking-title [&_h2]:text-text max-md:[&_h2]:mt-10 max-md:[&_h2]:text-title",
  "[&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-title [&_h3]:font-medium [&_h3]:text-text",
  "[&_a]:text-text [&_a]:underline [&_a]:decoration-2 [&_a]:decoration-purple-light [&_a]:underline-offset-4",
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:text-prose",
  "[&_pre]:mb-6 [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:border-2 [&_pre]:border-sunken [&_pre]:bg-control [&_pre]:px-6 [&_pre]:py-5",
  "[&_pre]:font-mono [&_pre]:text-small [&_pre]:text-text-soft",
  "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-small [&_:not(pre)>code]:text-text",
  "[&_blockquote]:mb-6 [&_blockquote]:rounded-lg [&_blockquote]:border-2 [&_blockquote]:border-sunken [&_blockquote]:bg-raised [&_blockquote]:px-7 [&_blockquote]:py-6",
  "[&_img]:mb-6 [&_img]:rounded-md [&_figcaption]:mt-3 [&_figcaption]:font-mono [&_figcaption]:text-caption [&_figcaption]:text-text-muted",
].join(" ");

const textOf = (children: ReactNode): string => (typeof children === "string" ? children : "");

export const PostContent = ({ markdown }: { markdown: string }) => (
  <div className={PROSE_CLASS}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ h2: ({ children }) => <h2 id={HeadingSlugUtil.toId(textOf(children))}>{children}</h2> }}
    >
      {markdown}
    </ReactMarkdown>
  </div>
);
