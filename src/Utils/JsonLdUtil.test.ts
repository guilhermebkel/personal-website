import { describe, expect, it } from "vitest";
import { JsonLdUtil } from "@/Utils/JsonLdUtil.ts";

const POST_PATH = "/blog/hello-world/";
const POST_URL = "https://guilherr.me/blog/hello-world/";
const POST_IMAGE = "https://guilherr.me/blog/hello-world/opengraph-image";
const PERSON_ID = "https://guilherr.me/#person";
const OWNER_NAME = "Guilherme Mota";
const PUBLISHED = "2026-11-23";
const UPDATED = "2026-11-24";

const POST = {
  title: "Hello, world",
  summary: "A placeholder post.",
  date: PUBLISHED,
  tags: ["cloud", "notes"],
  slug: "hello-world",
};

describe("JsonLdUtil.buildBlogPosting()", () => {
  it("carries the post's title, summary and date with its own address", () => {
    const data = JsonLdUtil.buildBlogPosting(POST, POST_PATH);
    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "Hello, world",
      description: "A placeholder post.",
      datePublished: PUBLISHED,
      url: POST_URL,
      inLanguage: "en",
    });
  });

  it("sets dateModified to the publication date when the post has no update", () => {
    const data = JsonLdUtil.buildBlogPosting(POST, POST_PATH);

    expect(data.dateModified).toBe(PUBLISHED);
  });

  it("sets dateModified to the update when the post has one", () => {
    const data = JsonLdUtil.buildBlogPosting({ ...POST, updated: UPDATED }, POST_PATH);

    expect(data).toMatchObject({ datePublished: PUBLISHED, dateModified: UPDATED });
  });

  it("points image at the post's share image, the same address as its og:image", () => {
    const data = JsonLdUtil.buildBlogPosting(POST, POST_PATH);

    expect(data.image).toBe(POST_IMAGE);
  });

  it("lists the tags as keywords, and omits keywords when there are none", () => {
    expect(JsonLdUtil.buildBlogPosting(POST, POST_PATH).keywords).toBe("cloud, notes");
    expect(JsonLdUtil.buildBlogPosting({ ...POST, tags: [] }, POST_PATH)).not.toHaveProperty("keywords");
  });

  it("names the author with the same @id as the home's Person", () => {
    const data = JsonLdUtil.buildBlogPosting(POST, POST_PATH);
    const home = JsonLdUtil.buildPerson();

    expect(data.author).toMatchObject({ "@type": "Person", "@id": PERSON_ID });
    expect(home).toMatchObject({ "@type": "Person", "@id": PERSON_ID });
    expect(data.author).toMatchObject({ name: OWNER_NAME, sameAs: home.sameAs });
  });
});

describe("JsonLdUtil.buildPerson()", () => {
  it("names the owner and lists only the profiles", () => {
    const data = JsonLdUtil.buildPerson();
    expect(data).toMatchObject({ "@type": "Person", name: OWNER_NAME, url: "https://guilherr.me/" });
    expect(data.sameAs).toHaveLength(2);
    expect(data.sameAs).not.toContain("https://whatsapp.guilherr.me");
  });
});
