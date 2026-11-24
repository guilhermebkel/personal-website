import { ContactUtil } from "@/Utils/ContactUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

const SCHEMA_CONTEXT = "https://schema.org";
const PROFILE_CONTACTS = ["linkedin", "github"];

type PostForJsonLd = {
  title: string;
  summary: string;
  date: string;
};

export class JsonLdUtil {
  static buildPerson(): Record<string, unknown> {
    const sameAs = ContactUtil.ALL.filter((contact) => PROFILE_CONTACTS.includes(contact.name)).map(
      (contact) => contact.href,
    );
    return {
      "@context": SCHEMA_CONTEXT,
      "@type": "Person",
      name: SiteUtil.NAME,
      url: SiteUtil.buildUrl("/"),
      sameAs,
    };
  }

  static buildBlogPosting(post: PostForJsonLd, path: string): Record<string, unknown> {
    const url = SiteUtil.buildUrl(path);
    return {
      "@context": SCHEMA_CONTEXT,
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      datePublished: post.date,
      author: { "@type": "Person", name: SiteUtil.NAME, url: SiteUtil.buildUrl("/") },
      mainEntityOfPage: url,
      url,
    };
  }
}
