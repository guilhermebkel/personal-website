import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ProjectService } from "@/Services/ProjectService.ts";

const URL_OK = "https://github.com/guilhermebkel/example";

const buildProject = (name: string, updatedAt: string, url = URL_OK) => {
  return JSON.stringify({ description: "A project.", language: "TypeScript", name, updatedAt, url });
};

const createDirectory = async () => {
  const prefix = join(tmpdir(), "projects-");
  return await mkdtemp(prefix);
};

const writeInto = async (directory: string, name: string, content: string) => {
  const path = join(directory, name);
  await writeFile(path, content);
};

describe("ProjectService.listProjects()", () => {
  it("lists the most recently updated project first", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "a.json", buildProject("a", "2026-01-01T00:00:00.000Z"));
    await writeInto(directory, "b.json", buildProject("b", "2026-05-01T00:00:00.000Z"));

    const projects = await new ProjectService(directory).listProjects();
    const names = projects.map((project) => project.name);

    expect(names).toStrictEqual(["b", "a"]);
  });

  it("fails when a project file has an invalid url", async () => {
    const directory = await createDirectory();
    const content = buildProject("bad", "2026-01-01T00:00:00.000Z", "nope");
    await writeInto(directory, "bad.json", content);

    await expect(new ProjectService(directory).listProjects()).rejects.toThrow(/url/iu);
  });
});
