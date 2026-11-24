import type { ReactNode } from "react";
import Image from "next/image";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@components/Link.tsx";
import { PostFigure } from "@components/PostFigure.tsx";
import { PostImage } from "@components/PostImage.tsx";
import { HeadingSlugUtil } from "@/Utils/HeadingSlugUtil.ts";

const PROSE_CLASS = [
  "w-full max-w-measure text-text-soft",
  "[&_p]:mb-6 [&_p]:text-prose",
  "[&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:scroll-mt-24 [&_h2]:text-subheading [&_h2]:font-medium [&_h2]:tracking-title [&_h2]:text-text max-md:[&_h2]:mt-10 max-md:[&_h2]:text-title max-lg:[&_h2]:scroll-mt-32",
  "[&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-title [&_h3]:font-medium [&_h3]:text-text max-md:[&_h3]:text-lead",
  "[&_a]:text-text [&_a]:underline [&_a]:decoration-2 [&_a]:decoration-purple-light [&_a]:underline-offset-4",
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:text-prose",
  "[&_pre]:mb-6 [&_pre]:rounded-sm [&_pre]:border-2 [&_pre]:border-sunken [&_pre]:bg-control [&_pre]:px-6 [&_pre]:py-5",
  "[&_pre]:font-mono [&_pre]:text-small [&_pre]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:text-text-soft",
  "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-small [&_:not(pre)>code]:text-text",
  "[&_blockquote]:mb-6 [&_blockquote]:rounded-lg [&_blockquote]:border-2 [&_blockquote]:border-sunken [&_blockquote]:bg-raised [&_blockquote]:mx-0 [&_blockquote]:px-7 [&_blockquote]:py-6 max-md:[&_blockquote]:px-5 max-md:[&_blockquote]:py-5 [&_blockquote>p:last-child]:mb-0",
  "[&_img]:mb-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_figcaption]:mt-3 [&_figcaption]:font-mono [&_figcaption]:text-caption [&_figcaption]:text-text-meta",
  "[&_sup]:text-small [&_sup_a]:text-purple-light [&_sup_a]:no-underline",
  "[&_[data-footnotes]]:mt-16 [&_[data-footnotes]]:border-t-2 [&_[data-footnotes]]:border-sunken [&_[data-footnotes]]:pt-8",
  "[&_[data-footnotes]_ol]:pl-6 [&_[data-footnotes]_li]:text-small [&_[data-footnotes]_li]:text-text-soft [&_[data-footnotes]_li]:scroll-mt-32",
].join(" ");

const FOOTNOTE_LABEL_ID = "footnote-label";
const NOTES_LABEL_CLASS = "mb-4 font-mono text-caption tracking-wide text-text-meta";

type MarkdownNode = NonNullable<ExtraProps["node"]>;
type ImageProps = { src: string; alt: string; title: string };

const getText = (children: ReactNode): string => (typeof children === "string" ? children : "");

const getOnlyImage = (node: MarkdownNode | undefined): ImageProps | undefined => {
  // Why: a paragraph or a link holding one image and nothing else is the figure's own case; a Markdown image inside a sentence is not, and renders inline.
  const meaningful = node?.children.filter((child) => child.type !== "text" || child.value.trim() !== "");
  const [only] = meaningful ?? [];
  if (meaningful?.length !== 1 || only?.type !== "element" || only.tagName !== "img") {
    return undefined;
  }
  const { properties } = only;
  return {
    src: properties.src ?? "",
    alt: properties.alt ?? "",
    title: properties.title ?? "",
  };
};

export const PostContent = ({ markdown }: { markdown: string }) => (
  <div className={PROSE_CLASS}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ node, children }) => {
          // Why: remark names the footnote block's heading "Footnotes" and hides it; the reader sees the mono label "Notes", and the id stays so the references can point at it.
          if (node?.properties.id === FOOTNOTE_LABEL_ID) {
            return (
              <div id={FOOTNOTE_LABEL_ID} className={NOTES_LABEL_CLASS}>
                Notes
              </div>
            );
          }
          return <h2 id={HeadingSlugUtil.buildId(getText(children))}>{children}</h2>;
        },
        p: ({ node, children }) => {
          const image = getOnlyImage(node);
          if (image === undefined) {
            return <p>{children}</p>;
          }
          return <PostFigure src={image.src} alt={image.alt} caption={image.title} />;
        },
        img: ({ src, alt }) => <PostImage src={typeof src === "string" ? src : ""} alt={alt ?? ""} />,
        a: ({ href = "#", node, children }) => {
          // Why: a link to a note on this page stays in this tab; only a link that leaves the page opens a new one.
          if (href.startsWith("#")) {
            return <Link href={href}>{children}</Link>;
          }
          const image = getOnlyImage(node);
          if (image !== undefined) {
            // Why: a screenshot used as a link keeps its link, so the tap follows it and the image is not zoomed.
            return (
              <Link href={href} target="_blank" hasExternalIcon={false}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized
                  className="mb-0 h-auto w-full rounded-md"
                />
              </Link>
            );
          }
          return (
            <Link href={href} target="_blank">
              {children}
            </Link>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  </div>
);
