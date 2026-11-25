import { ContactUtil } from "@/Utils/ContactUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

const SCHEMA_CONTEXT = "https://schema.org";
const PROFILE_CONTACTS = ["linkedin", "github"];
const LANGUAGE = "en";
const KEYWORD_SEPARATOR = ", ";

// Why: the home's Person and every post's author share this @id, so search engines and AI search read one owner, not two anonymous people.
export const PERSON_ID = `${SiteUtil.URL}/#person`;

type PostForJsonLd = {
  title: string;
  summary: string;
  date: string;
  updated?: string;
  tags: string[];
  slug: string;
};

export class JsonLdUtil {
  static buildPerson(): Record<string, unknown> {
    return {
      "@context": SCHEMA_CONTEXT,
      "@type": "Person",
      "@id": PERSON_ID,
      ...JsonLdUtil.buildOwnerFields(),
    };
  }

  static buildBlogPosting(post: PostForJsonLd, path: string): Record<string, unknown> {
    const url = SiteUtil.buildUrl(path);
    return {
      "@context": SCHEMA_CONTEXT,
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      image: SiteUtil.buildPostImageUrl(post.slug),
      datePublished: post.date,
      // Why: dateModified is the update when the post has one; otherwise it is the publication date.
      dateModified: post.updated ?? post.date,
      ...(post.tags.length > 0 ? { keywords: post.tags.join(KEYWORD_SEPARATOR) } : {}),
      inLanguage: LANGUAGE,
      author: { "@type": "Person", "@id": PERSON_ID, ...JsonLdUtil.buildOwnerFields() },
      mainEntityOfPage: url,
      url,
    };
  }

  static buildOwnerFields(): Record<string, unknown> {
    const sameAs = ContactUtil.ALL.filter((contact) => PROFILE_CONTACTS.includes(contact.name)).map(
      (contact) => contact.href,
    );
    return {
      name: SiteUtil.NAME,
      url: SiteUtil.buildUrl("/"),
      sameAs,
    };
  }
}
