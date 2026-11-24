import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Project } from "@/Protocols/ProjectProtocol.ts";
import { ProjectSchema } from "@/Schemas/ProjectSchema.ts";

const PROJECT_EXTENSION = ".json";

const compareProjects = (first: Project, second: Project): number => {
  if (first.order !== undefined && second.order !== undefined) {
    return first.order - second.order;
  }
  // Why: a project with an order comes before one without it.
  if (first.order !== undefined) {
    return -1;
  }
  if (second.order !== undefined) {
    return 1;
  }
  // Why: the others list the most recently updated first; ISO dates sort as plain strings.
  return second.updatedAt.localeCompare(first.updatedAt);
};

export class ProjectService {
  constructor(
    private readonly projectsDirectory: string,
    private readonly publicDirectory: string,
  ) {}

  async listProjects(): Promise<Project[]> {
    const names = await readdir(this.projectsDirectory);
    const files = names.filter((name) => name.endsWith(PROJECT_EXTENSION));
    const projects = await Promise.all(files.map((file) => this.readProject(file)));
    return projects.sort(compareProjects);
  }

  private async readProject(file: string): Promise<Project> {
    const source = await readFile(join(this.projectsDirectory, file), "utf8");
    // Why: an invalid file must fail the build and keep the last good site live.
    const project = ProjectSchema.parse(JSON.parse(source));
    // Why: the cover is a path under public/, checked here so a missing image fails the build instead of showing a broken picture.
    if (project.cover !== undefined) {
      await access(join(this.publicDirectory, project.cover)).catch(() => {
        throw new Error(`project "${project.name}": cover file not found at public${project.cover}`);
      });
    }
    return project;
  }
}
