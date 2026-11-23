import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Project } from "@/Protocols/ProjectProtocol.ts";
import { ProjectSchema } from "@/Schemas/ProjectSchema.ts";

const PROJECT_EXTENSION = ".json";

export class ProjectService {
  constructor(private readonly projectsDirectory: string) {}

  async listProjects(): Promise<Project[]> {
    const names = await readdir(this.projectsDirectory);
    const files = names.filter((name) => name.endsWith(PROJECT_EXTENSION));
    const projects = await Promise.all(files.map((file) => this.readProject(file)));
    return projects.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  }

  private async readProject(file: string): Promise<Project> {
    const source = await readFile(join(this.projectsDirectory, file), "utf8");
    // Why: the cron writes these files; an invalid one must fail the build and keep the last good site live.
    return ProjectSchema.parse(JSON.parse(source));
  }
}
