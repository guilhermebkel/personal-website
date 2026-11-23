import { Icon } from "@components/Icon.tsx";
import { Tag } from "@components/Tag.tsx";
import { Cover } from "@components/Cover.tsx";

type ProjectCardProps = {
  index: number;
  name: string;
  description: string;
  url: string;
  tags: string[];
};

const NUMBER_WIDTH = 2;

const hostOf = (url: string) => new URL(url).host;

export const ProjectCard = ({ index, name, description, url, tags }: ProjectCardProps) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={[
      "group/card flex w-96 flex-none flex-col overflow-hidden rounded-lg border-2 border-sunken bg-raised text-text no-underline",
      "transition-colors duration-250 max-md:w-72 md:hover:border-line",
    ].join(" ")}
  >
    <Cover className="h-47.5 flex-none" />
    <div className="flex min-w-0 flex-1 flex-col px-7 py-6">
      <span className="font-mono text-caption tracking-wide text-text-muted">{`P/${String(index + 1).padStart(NUMBER_WIDTH, "0")}`}</span>
      <h3 className="m-0 mt-3.5 text-title font-medium wrap-anywhere">{name}</h3>
      <p className="m-0 mt-3 text-small leading-5.5 text-text-soft md:text-body md:leading-5.5">{description}</p>
      {tags.length > 0 && (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
          {tags.map((tag) => (
            <li key={tag}>
              <Tag label={tag} variant="project" />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="truncate font-mono text-caption text-text-muted">{hostOf(url)}</span>
        <span
          className={[
            "inline-flex h-9 items-center gap-2 rounded-pill border-2 border-purple-light px-4 text-small font-medium transition-colors duration-250",
            "group-hover/card:border-purple group-hover/card:bg-purple",
          ].join(" ")}
        >
          Open
          <Icon
            name="external"
            className="size-3.5 transition-transform duration-250 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
          />
        </span>
      </div>
    </div>
  </a>
);
