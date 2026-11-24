import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ProjectService } from "@/Services/ProjectService.ts";

const URL_OK = "https://github.com/guilhermebkel/example";
const JANUARY = "2026-01-01T00:00:00.000Z";
const MAY = "2026-05-01T00:00:00.000Z";
const SEPTEMBER = "2026-09-01T00:00:00.000Z";
const BAD_FILE = "bad.json";
const COVER = "/projects/a.png";

type ProjectOverrides = Record<string, unknown>;

const buildProject = (name: string, updatedAt: string, overrides: ProjectOverrides = {}) => {
  return JSON.stringify({ description: "A project.", kind: "application", name, updatedAt, url: URL_OK, ...overrides });
};

const createDirectory = async () => {
  const prefix = join(tmpdir(), "projects-");
  return await mkdtemp(prefix);
};

const writeInto = async (directory: string, name: string, content: string) => {
  const path = join(directory, name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

const writeProject = async (
  directory: string,
  file: string,
  name: string,
  updatedAt: string,
  overrides: ProjectOverrides = {},
) => {
  const content = buildProject(name, updatedAt, overrides);
  await writeInto(directory, file, content);
};

const listProjects = async (directory: string, publicDirectory = directory) => {
  const service = new ProjectService(directory, publicDirectory);
  return await service.listProjects();
};

const listNames = async (directory: string) => {
  const projects = await listProjects(directory);
  return projects.map((project) => project.name);
};

describe("ProjectService.listProjects()", () => {
  it("lists the most recently updated project first when none has an order", async () => {
    const directory = await createDirectory();
    await writeProject(directory, "a.json", "a", JANUARY);
    await writeProject(directory, "b.json", "b", MAY);

    const names = await listNames(directory);

    expect(names).toStrictEqual(["b", "a"]);
  });

  it("lists the project with the lowest order first", async () => {
    const directory = await createDirectory();
    await writeProject(directory, "a.json", "a", MAY, { order: 2 });
    await writeProject(directory, "b.json", "b", JANUARY, { order: 1 });

    const names = await listNames(directory);

    expect(names).toStrictEqual(["b", "a"]);
  });

  it("lists the ordered projects before the ones without an order", async () => {
    const directory = await createDirectory();
    await writeProject(directory, "a.json", "a", SEPTEMBER);
    await writeProject(directory, "b.json", "b", JANUARY, { order: 3 });
    await writeProject(directory, "c.json", "c", MAY);

    const names = await listNames(directory);

    expect(names).toStrictEqual(["b", "a", "c"]);
  });

  it("ignores a leftover tags key in a project file", async () => {
    const directory = await createDirectory();
    await writeProject(directory, "a.json", "a", JANUARY, { tags: ["TypeScript"] });

    const projects = await listProjects(directory);

    expect(projects[0]).not.toHaveProperty("tags");
  });

  it("fails when a project file has an invalid url", async () => {
    const directory = await createDirectory();
    await writeProject(directory, BAD_FILE, "bad", JANUARY, { url: "nope" });

    const listing = listProjects(directory);

    await expect(listing).rejects.toThrow(/url/iu);
  });

  it("fails when a project has a kind outside the list", async () => {
    const directory = await createDirectory();
    await writeProject(directory, BAD_FILE, "bad", JANUARY, { kind: "toy" });

    const listing = listProjects(directory);

    await expect(listing).rejects.toThrow(/kind/iu);
  });

  it.each([0, -1, 1.5])("fails when the order is %s", async (order) => {
    const directory = await createDirectory();
    await writeProject(directory, BAD_FILE, "bad", JANUARY, { order });

    const listing = listProjects(directory);

    await expect(listing).rejects.toThrow(/order/iu);
  });

  it("fails when the cover file is missing under public", async () => {
    const directory = await createDirectory();
    const publicDirectory = await createDirectory();
    await writeProject(directory, "a.json", "a", JANUARY, { cover: COVER });

    const listing = listProjects(directory, publicDirectory);

    await expect(listing).rejects.toThrow('project "a": cover file not found at public/projects/a.png');
  });

  it("lists a project whose cover file exists", async () => {
    const directory = await createDirectory();
    const publicDirectory = await createDirectory();
    await writeInto(publicDirectory, COVER, "image");
    await writeProject(directory, "a.json", "a", JANUARY, { cover: COVER });

    const projects = await listProjects(directory, publicDirectory);

    expect(projects[0]?.cover).toBe(COVER);
  });
});
