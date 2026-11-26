import type { ReactNode } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBody } from "@components/CodeBody.tsx";
import { Link } from "@components/Link.tsx";
import { PostFigure } from "@components/PostFigure.tsx";
import { PostImage } from "@components/PostImage.tsx";
import { CodeHighlightUtil } from "@/Utils/CodeHighlightUtil.ts";
import { HeadingSlugUtil } from "@/Utils/HeadingSlugUtil.ts";
import { InfoStringUtil } from "@/Utils/InfoStringUtil.ts";

const PROSE_CLASS = [
  "w-full max-w-measure text-text-soft",
  "[&_p]:mb-6 [&_p]:text-prose",
  "[&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:scroll-mt-24 [&_h2]:text-subheading [&_h2]:font-medium [&_h2]:tracking-title [&_h2]:text-text max-md:[&_h2]:mt-10 max-md:[&_h2]:text-title max-lg:[&_h2]:scroll-mt-32",
  "[&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-title [&_h3]:font-medium [&_h3]:text-text max-md:[&_h3]:text-lead",
  "[&_a]:text-text [&_a]:underline [&_a]:decoration-2 [&_a]:decoration-purple-light [&_a]:underline-offset-4",
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:text-prose",
  "[&_pre]:mb-6 [&_pre]:rounded-sm [&_pre]:border-2 [&_pre]:border-sunken [&_pre]:bg-control [&_pre]:px-6 [&_pre]:py-5",
  "[&_pre]:font-mono [&_pre]:text-small [&_pre]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:text-text-soft",
  "[&_.tok-keyword]:text-syntax-keyword [&_.tok-string]:text-syntax-string [&_.tok-comment]:text-syntax-comment [&_.tok-constant]:text-syntax-constant [&_.tok-function]:text-syntax-function",
  "[&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-lift [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:box-decoration-clone [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-small [&_:not(pre)>code]:text-text",
  "[&_blockquote]:mb-6 [&_blockquote]:rounded-lg [&_blockquote]:border-2 [&_blockquote]:border-sunken [&_blockquote]:bg-raised [&_blockquote]:mx-0 [&_blockquote]:px-7 [&_blockquote]:py-6 max-md:[&_blockquote]:px-5 max-md:[&_blockquote]:py-5 [&_blockquote>p:last-child]:mb-0",
  "[&_img]:mb-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_figcaption]:mt-3 [&_figcaption]:font-mono [&_figcaption]:text-caption [&_figcaption]:text-text-meta",
  "[&_sup]:text-small [&_sup_a]:text-purple-light [&_sup_a]:no-underline",
  "[&_[data-footnotes]]:mt-16 [&_[data-footnotes]]:border-t-2 [&_[data-footnotes]]:border-sunken [&_[data-footnotes]]:pt-8",
  "[&_[data-footnotes]_ol]:pl-6 [&_[data-footnotes]_li]:text-small [&_[data-footnotes]_li]:text-text-soft [&_[data-footnotes]_li]:scroll-mt-32",
].join(" ");

const FOOTNOTE_LABEL_ID = "footnote-label";
const NOTES_LABEL_CLASS = "mb-4 font-mono text-caption tracking-wide text-text-meta";
const CODE_BLOCK_CLASS = "mb-6 overflow-hidden rounded-lg border-2 border-sunken bg-surface";
const CODE_HEADER_CLASS =
  "flex items-center justify-between gap-6 border-b-2 border-sunken bg-lift px-5 py-2.5 font-mono text-small text-text-soft list-none [&::-webkit-details-marker]:hidden";

const TABLE_WRAP_CLASS = "mb-6 overflow-x-auto rounded-lg border-2 border-line bg-surface";
const TABLE_HEAD_CLASS = "border border-line bg-lift px-5 py-3 text-left font-medium text-text";
const TABLE_CELL_CLASS = "border border-line px-5 py-3 align-top text-prose text-text-soft";

type MarkdownNode = NonNullable<ExtraProps["node"]>;
type ImageProps = { src: string; alt: string; title: string };

const getText = (children: ReactNode): string => (typeof children === "string" ? children : "");

const TITLE_ATTRIBUTE = "title";
const COLLAPSED_FLAG = "collapsed";
const LANGUAGE_PREFIX = "language-";
const CODE_LABEL = "code";

type CodeElement = Extract<MarkdownNode["children"][number], { type: "element" }>;

const getCodeElement = (node: MarkdownNode | undefined): CodeElement | undefined => {
  // Why: the code block's options and language are kept on its <code> child by the Markdown tree; the <pre> itself does not carry them.
  return node?.children.find((child): child is CodeElement => child.type === "element");
};

const getCodeInfo = (node: MarkdownNode | undefined): string | undefined => {
  const meta = getCodeElement(node)?.data?.meta;
  return typeof meta === "string" ? meta : undefined;
};

const getLanguageLabel = (node: MarkdownNode | undefined): string => {
  const className = getCodeElement(node)?.properties.className;
  const classes: unknown[] = Array.isArray(className) ? className : [];
  const language = classes.find((name): name is string => typeof name === "string" && name.startsWith(LANGUAGE_PREFIX));
  return language === undefined ? CODE_LABEL : language.slice(LANGUAGE_PREFIX.length);
};

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
      rehypePlugins={[CodeHighlightUtil.buildRehypePlugin]}
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
        pre: ({ node, children }) => {
          const info = getCodeInfo(node);
          const title = InfoStringUtil.readQuoted(info, TITLE_ATTRIBUTE);
          const collapsed = InfoStringUtil.hasFlag(info, COLLAPSED_FLAG);
          if (title === undefined && !collapsed) {
            // Why: a plain block shows its language in a header, as the assistant's own code blocks do; a block without a language stays bare.
            const language = getLanguageLabel(node);
            if (language === CODE_LABEL) {
              return <CodeBody>{children}</CodeBody>;
            }
            return (
              <div className={CODE_BLOCK_CLASS}>
                <div className={CODE_HEADER_CLASS}>
                  <span className="min-w-0 break-all">{language}</span>
                </div>
                <CodeBody>{children}</CodeBody>
              </div>
            );
          }
          const label = title ?? getLanguageLabel(node);
          if (!collapsed) {
            // Why: a titled block stays open; its header names the file, as the code blocks of the assistant's own replies do.
            return (
              <div className={CODE_BLOCK_CLASS}>
                <div className={CODE_HEADER_CLASS}>
                  <span className="min-w-0 break-all">{label}</span>
                </div>
                <CodeBody>{children}</CodeBody>
              </div>
            );
          }
          // Why: a collapsed block is a native <details>, so it opens and closes with the keyboard and its content stays in the static HTML without JavaScript.
          return (
            <details className={`group ${CODE_BLOCK_CLASS}`}>
              <summary className={`${CODE_HEADER_CLASS} cursor-pointer`}>
                <span className="min-w-0 break-all">{label}</span>
                <span className="shrink-0 text-text-meta group-open:hidden">Show code</span>
                <span className="hidden shrink-0 text-text-meta group-open:inline">Hide code</span>
              </summary>
              <CodeBody>{children}</CodeBody>
            </details>
          );
        },
        table: ({ children }) => (
          // Why: a wide table scrolls inside its frame, so the page itself never scrolls sideways on a phone.
          <div className={TABLE_WRAP_CLASS}>
            <table className="w-full border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className={TABLE_HEAD_CLASS}>{children}</th>,
        td: ({ children }) => <td className={TABLE_CELL_CLASS}>{children}</td>,
        img: ({ src, alt }) => <PostImage src={typeof src === "string" ? src : ""} alt={alt ?? ""} />,
        a: ({ href = "#", node, children, id, "aria-describedby": describedBy, "aria-label": label }) => {
          // Why: a link to a note on this page stays in this tab; only a link that leaves the page opens a new one.
          if (href.startsWith("#")) {
            // Why: a note's reference carries the id its "back" link points at, and the back link carries its aria-label, so both are kept.
            return (
              <Link href={href} id={id} aria-describedby={describedBy} aria-label={label} plain>
                {children}
              </Link>
            );
          }
          const image = getOnlyImage(node);
          if (image !== undefined) {
            // Why: a screenshot used as a link keeps its link, so the tap follows it and the image is not zoomed.
            return (
              <Link href={href} target="_blank" hasExternalIcon={false} plain>
                <img src={image.src} alt={image.alt} className="mb-0 h-auto w-full rounded-md" />
              </Link>
            );
          }
          return (
            <Link href={href} target="_blank" plain>
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
