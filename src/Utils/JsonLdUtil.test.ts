import { describe, expect, it } from "vitest";
import { JsonLdUtil } from "@/Utils/JsonLdUtil.ts";

describe("JsonLdUtil.buildBlogPosting()", () => {
  it("carries the post's title, summary and date with its own address", () => {
    const data = JsonLdUtil.buildBlogPosting(
      { title: "Hello, world", summary: "A placeholder post.", date: "2026-11-23" },
      "/blog/hello-world/",
    );
    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "Hello, world",
      description: "A placeholder post.",
      datePublished: "2026-11-23",
      url: "https://guilherr.me/blog/hello-world/",
    });
  });
});

describe("JsonLdUtil.buildPerson()", () => {
  it("names the owner and lists only the profiles", () => {
    const data = JsonLdUtil.buildPerson();
    expect(data).toMatchObject({ "@type": "Person", name: "Guilherme Mota", url: "https://guilherr.me/" });
    expect(data.sameAs).toHaveLength(2);
    expect(data.sameAs).not.toContain("https://whatsapp.guilherr.me");
  });
});
