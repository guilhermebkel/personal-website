import { Icon } from "@components/Icon.tsx";
import { Tag } from "@components/Tag.tsx";
import { Cover } from "@components/Cover.tsx";
import { ProjectLabelUtil } from "@/Utils/ProjectLabelUtil.ts";
import type { ProjectKind } from "@/Protocols/ProjectProtocol.ts";

type ProjectCardProps = {
  name: string;
  description: string;
  url: string;
  kind: ProjectKind;
  cover?: string;
};

const getHost = (url: string) => new URL(url).host;

export const ProjectCard = ({ name, description, url, kind, cover }: ProjectCardProps) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={[
      "group/card flex w-96 flex-none flex-col overflow-hidden rounded-lg border-2 border-sunken bg-raised text-text no-underline",
      "duration-hover transition-colors max-md:w-72 md:hover:border-line",
    ].join(" ")}
  >
    <div className="flex-none p-3">
      <Cover seed={name} image={cover} className="h-47.5 rounded-md max-md:h-37.5" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col px-7 py-6 max-md:px-5 max-md:py-5">
      <div>
        <Tag label={ProjectLabelUtil.getKindLabel(kind)} variant="project" />
      </div>
      <h3 className="m-0 mt-3.5 text-title font-medium wrap-anywhere">{name}</h3>
      <p className="m-0 mt-3 text-small leading-5.5 text-text-soft md:text-body md:leading-5.5">{description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="truncate font-mono text-caption text-text-meta">{getHost(url)}</span>
        <span
          className={[
            "duration-hover inline-flex h-9 items-center gap-2 rounded-pill border-2 border-purple-light px-4 text-small font-medium transition-colors",
            "group-hover/card:border-purple group-hover/card:bg-purple",
          ].join(" ")}
        >
          Open
          <Icon
            name="external"
            className="duration-hover size-3.5 transition-transform group-hover/card:translate-x-0.75 group-hover/card:-translate-y-0.75"
          />
        </span>
      </div>
    </div>
  </a>
);
