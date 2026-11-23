import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { findAffectedSpecs, listAllSpecs } from "./affected-specs.mjs";

const BLOG_PAGE = "app/blog/page.tsx";
const EVERY_SPEC = ["blog", "home"];

describe("findAffectedSpecs()", () => {
  it("maps a route folder to its specs", () => {
    expect(findAffectedSpecs([BLOG_PAGE], EVERY_SPEC)).toStrictEqual(["blog"]);
  });

  it("selects no spec for a folder no browser test can break", () => {
    expect(findAffectedSpecs(["src/Utils/TimeUtil.ts", "docs/test-standards.md"], EVERY_SPEC)).toStrictEqual([]);
  });

  it("selects no spec for a unit test, wherever it sits", () => {
    expect(findAffectedSpecs(["src/Services/PostService.test.ts"], EVERY_SPEC)).toStrictEqual([]);
  });

  it("selects the spec itself when a spec changed", () => {
    expect(findAffectedSpecs(["e2e/home.spec.ts"], EVERY_SPEC)).toStrictEqual(["home"]);
  });

  it("selects every spec for a path with no entry", () => {
    expect(findAffectedSpecs(["app/globals.css"], EVERY_SPEC)).toStrictEqual(EVERY_SPEC);
  });

  it("selects every spec when one path has no entry among mapped ones", () => {
    expect(findAffectedSpecs([BLOG_PAGE, "components/SiteNav.tsx"], EVERY_SPEC)).toStrictEqual(EVERY_SPEC);
  });
});

describe("listAllSpecs()", () => {
  it("lists the spec names of the e2e folder, sorted", () => {
    const prefix = join(tmpdir(), "specs-");
    const root = mkdtempSync(prefix);
    const folder = join(root, "e2e");
    mkdirSync(folder);
    for (const name of ["home.spec.ts", "blog.spec.ts", "helpers.ts"]) {
      writeFileSync(join(folder, name), "");
    }

    const specs = listAllSpecs(root);

    expect(specs).toStrictEqual(["blog", "home"]);
  });
});
