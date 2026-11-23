import { Tag } from "@components/Tag.tsx";

type PostInfoProps = {
  date: string;
  readingMinutes: number;
  title: string;
  summary?: string;
  tags?: string[];
  headingLevel?: "h1" | "h2" | "h3";
  isLarge?: boolean;
};

export const PostInfo = (props: PostInfoProps) => {
  // Why: the post page shows a larger title than a card does.
  const { date, readingMinutes, title, summary, tags = [], headingLevel = "h3", isLarge = false } = props;
  const Heading = headingLevel;
  const titleSize = isLarge ? "text-section tracking-title max-md:text-heading" : "text-title";
  return (
    <div className="flex min-w-0 flex-col text-text">
      <p className="m-0 font-mono text-caption tracking-wide text-text-meta">{`${date} · ${readingMinutes} min read`}</p>
      <Heading className={`m-0 font-medium ${isLarge ? "mt-4 max-w-250" : "mt-2.5"} ${titleSize}`}>{title}</Heading>
      {summary !== undefined && (
        <p className="m-0 mt-2 text-small leading-5.5 text-text-summary md:text-body">{summary}</p>
      )}
      {tags.length > 0 && (
        <ul className={`m-0 flex list-none flex-wrap gap-2 p-0 ${isLarge ? "mt-5" : "mt-3.5"}`}>
          {tags.map((tag) => (
            <li key={tag}>
              <Tag label={tag} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
