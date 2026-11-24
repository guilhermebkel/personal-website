import { Button } from "@components/Button.tsx";
import { ContactLink } from "@components/ContactLink.tsx";
import { Link } from "@components/Link.tsx";
import { HeroLogoIcon } from "@components/Icons/HeroLogoIcon.tsx";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { Reveal } from "@components/Reveal.tsx";
import { PostRow } from "@components/PostRow.tsx";
import { ProjectCarousel } from "@components/ProjectCarousel/index.tsx";
import { QuoteCarousel } from "@components/QuoteCarousel/index.tsx";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { SocialBar } from "@components/SocialBar.tsx";
import { Spotlight } from "@components/Spotlight.tsx";
import NextLink from "next/link";
import type { Metadata } from "next";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { JsonLd } from "@components/JsonLd.tsx";
import { JsonLdUtil } from "@/Utils/JsonLdUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";
import { ContactUtil } from "@/Utils/ContactUtil.ts";
import { MotionUtil } from "@/Utils/MotionUtil.ts";
import { QuoteUtil } from "@/Utils/QuoteUtil.ts";

const LATEST_POSTS = 4;

export const metadata: Metadata = {
  title: { absolute: SiteUtil.NAME },
  description: SiteUtil.DESCRIPTION,
  alternates: { canonical: "/", ...SiteUtil.FEED_ALTERNATES },
  openGraph: {
    title: SiteUtil.NAME,
    description: SiteUtil.DESCRIPTION,
    url: SiteUtil.buildUrl("/"),
    type: "website",
  },
  twitter: { card: "summary_large_image", title: SiteUtil.NAME, description: SiteUtil.DESCRIPTION },
};

// Why: the hero plays in order, as in the prototype: the label, the name written, the text, the buttons, the social bar (milliseconds).
const FIRST_NAME_DELAY = 150;
const LAST_NAME_DELAY = 600;
const MARKER_DELAY = 1000;
const TEXT_DELAY = 1000;
const BUTTONS_DELAY = 1150;
const SOCIAL_DELAY = 1300;

const Hero = () => (
  <section
    id="intro"
    aria-labelledby="intro-title"
    className={`relative flex min-h-[calc(100dvh-var(--spacing-navbar))] scroll-mt-navbar flex-col justify-between pb-9 max-md:pb-6 ${PAGE_X}`}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 hero-glow"
    />
    <HeroLogoIcon className="mx-auto mt-5 hidden w-50 flex-none max-md:block" />
    <div className="flex flex-1 items-center justify-between gap-10 max-md:mt-5 max-md:items-start lg:items-start">
      <div className="max-w-155 lg:pt-28">
        <Reveal>
          <p className="m-0 text-small tracking-eyebrow text-text-muted uppercase max-md:text-caption">Introduction</p>
        </Reveal>
        <h1 id="intro-title" className="m-0 mt-4 font-signature text-hero font-medium max-md:text-hero-sm">
          <span
            style={{ animationDelay: `${FIRST_NAME_DELAY}ms` }}
            className="block w-max animate-write motion-reduce:animate-none"
          >
            Guilherme
          </span>
          <span
            style={{ animationDelay: `${LAST_NAME_DELAY}ms` }}
            className="ml-7 block w-max animate-write motion-reduce:animate-none max-md:ml-0"
          >
            <Spotlight
              delay={MARKER_DELAY}
              width="calc(100% + var(--spacing) * 7)"
              left="calc(var(--spacing) * -3.5)"
              height="46%"
              bottom="calc(var(--spacing) * 0.5)"
            >
              Mota
            </Spotlight>
          </span>
        </h1>
        <Reveal delay={TEXT_DELAY}>
          <p className="m-0 mt-8 max-w-115 text-lead leading-8 text-text-soft max-md:mt-6 max-md:text-body max-md:leading-6">
            A problem solver who knows that knows nothing, passionate about cloud computing and complex systems.
          </p>
        </Reveal>
        <Reveal delay={BUTTONS_DELAY} className="mt-10 flex flex-wrap items-center gap-8 max-md:mt-6 max-md:gap-6">
          <Button asChild variant="primary">
            <a href="#projects">See projects</a>
          </Button>
          <Link href="/blog/">Read the posts</Link>
        </Reveal>
      </div>
      <HeroLogoIcon className="mt-10 hidden h-auto w-100 flex-none self-start lg:block" />
    </div>
    <Reveal delay={SOCIAL_DELAY} className="flex justify-center max-md:mt-10 max-md:justify-start">
      <SocialBar />
    </Reveal>
  </section>
);

const HomePage = async () => {
  const projects = await ContentFactory.createProjectService().listProjects();
  const posts = (await ContentFactory.createPostService().listPosts()).slice(0, LATEST_POSTS);
  const carouselProjects = projects.map((project) => ({
    name: project.name,
    description: project.description,
    url: project.url,
    kind: project.kind,
    cover: project.cover,
  }));
  return (
    <div className="flex flex-col gap-28 pb-28">
      <JsonLd data={JsonLdUtil.buildPerson()} />
      <Hero />
      {carouselProjects.length > 0 && <ProjectCarousel projects={carouselProjects} />}
      <section id="posts" aria-labelledby="posts-title" className={`scroll-mt-navbar ${PAGE_X}`}>
        <SectionTitle
          headingId="posts-title"
          eyebrow="02 — Posts"
          title="What I've been writing"
          action={
            <Button asChild variant="primary" className="h-12 max-md:hidden">
              <NextLink href="/blog/">
                See all posts
                <Icon name="external" />
              </NextLink>
            </Button>
          }
        />
        <div className="mt-10 flex flex-col">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={MotionUtil.getStaggerDelay(index)}>
              <PostRow
                href={`/blog/${post.slug}/`}
                date={post.date}
                readingMinutes={post.readingMinutes}
                title={post.title}
                summary={post.summary}
                cover={post.cover}
              />
            </Reveal>
          ))}
        </div>
      </section>
      <section id="quotes" aria-labelledby="quotes-title" className={`scroll-mt-navbar ${PAGE_X}`}>
        <SectionTitle headingId="quotes-title" eyebrow="03 — Quotes" title="Words I build on" />
        <div className="mt-18">
          <Reveal>
            <QuoteCarousel quotes={QuoteUtil.ALL} />
          </Reveal>
        </div>
      </section>
      <section id="contact" aria-labelledby="contact-title" className={`scroll-mt-navbar ${PAGE_X}`}>
        <SectionTitle headingId="contact-title" eyebrow="04 — Contact" title="Let's talk" />
        <ul className="m-0 mt-14 flex list-none flex-wrap gap-4 p-0">
          {ContactUtil.ALL.map((contact, index) => (
            <Reveal key={contact.name} as="li" delay={MotionUtil.getStaggerDelay(index)} className="max-md:w-full">
              <ContactLink contact={contact} />
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
