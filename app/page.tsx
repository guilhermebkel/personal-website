import Link from "next/link";
import { Button } from "@components/Button.tsx";
import { ContactLink } from "@components/ContactLink.tsx";
import { HeroLogoIcon } from "@components/Icons/HeroLogoIcon.tsx";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@components/LayoutClasses.ts";
import { Reveal } from "@components/Reveal.tsx";
import { PostRow } from "@components/PostRow.tsx";
import { ProjectCarousel } from "@components/ProjectCarousel.tsx";
import { QuoteCarousel } from "@components/QuoteCarousel.tsx";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { SocialBar } from "@components/SocialBar.tsx";
import { Spotlight } from "@components/Spotlight.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { ContactUtil } from "@/Utils/ContactUtil.ts";
import { MotionUtil } from "@/Utils/MotionUtil.ts";
import { QuoteUtil } from "@/Utils/QuoteUtil.ts";

const LATEST_POSTS = 4;

// Why: the hero plays in order, as in the prototype: the label, the name written, the text, the buttons, the social bar (milliseconds).
const FIRST_NAME_DELAY = 150;
const LAST_NAME_DELAY = 600;
const MARKER_DELAY = 1000;
const TEXT_DELAY = 1000;
const BUTTONS_DELAY = 1150;
const SOCIAL_DELAY = 1300;

const Hero = () => (
  <section className={`hero-glow relative flex flex-col gap-16 pt-16 pb-24 ${PAGE_X}`}>
    <div className="flex items-start justify-between gap-10">
      <div className="max-w-155">
        <Reveal>
          <p className="m-0 text-small tracking-eyebrow text-text-muted uppercase">Introduction</p>
        </Reveal>
        <h1 className="m-0 mt-4 font-signature text-hero font-medium max-md:text-hero-sm">
          <span style={{ animationDelay: `${FIRST_NAME_DELAY}ms` }} className="block w-max animate-write motion-reduce:animate-none">Guilherme</span>
          <span style={{ animationDelay: `${LAST_NAME_DELAY}ms` }} className="block w-max ml-7 animate-write motion-reduce:animate-none max-md:ml-0">
            <Spotlight delay={MARKER_DELAY} width="calc(100% + var(--spacing) * 7)" left="calc(var(--spacing) * -3.5)" height="46%" bottom="calc(var(--spacing) * 0.5)">
              Mota
            </Spotlight>
          </span>
        </h1>
        <Reveal delay={TEXT_DELAY}>
          <p className="m-0 mt-8 max-w-115 text-lead leading-8 text-text-soft">
            A problem solver who knows that knows nothing, passionate about cloud computing and complex systems.
          </p>
        </Reveal>
        <Reveal delay={BUTTONS_DELAY} className="mt-10 flex flex-wrap items-center gap-8">
          <Button asChild variant="primary">
            <a href="#projects">See projects</a>
          </Button>
          <Link href="/blog/" className="text-body text-text no-underline">Read the posts</Link>
        </Reveal>
      </div>
      <HeroLogoIcon className="mr-24 hidden h-auto w-100 flex-none lg:block" />
    </div>
    <Reveal delay={SOCIAL_DELAY} className="flex justify-center">
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
    tags: project.language === null ? [] : [project.language],
  }));
  return (
    <div className="flex flex-col gap-28 pb-28">
      <Hero />
      {carouselProjects.length > 0 && <ProjectCarousel projects={carouselProjects} />}
      <section aria-labelledby="posts-title" className={PAGE_X}>
        <SectionTitle
          eyebrow="02 — Posts"
          title="What I've been writing"
          action={(
            <Button asChild variant="primary" className="h-12 max-md:hidden">
              <Link href="/blog/">
                See all posts
                <Icon name="external" />
              </Link>
            </Button>
          )}
        />
        <div className="mt-10 flex flex-col border-t-2 border-sunken">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={MotionUtil.delayFor(index)}>
              <PostRow
                href={`/blog/${post.slug}/`}
                date={post.date}
                readingMinutes={post.readingMinutes}
                title={post.title}
                summary={post.summary}
              />
            </Reveal>
          ))}
        </div>
      </section>
      <section aria-labelledby="quotes-title" className={PAGE_X}>
        <SectionTitle eyebrow="03 — Quotes" title="Words I build on" />
        <div className="mt-18">
          <Reveal>
            <QuoteCarousel quotes={QuoteUtil.ALL} />
          </Reveal>
        </div>
      </section>
      <section aria-labelledby="contact-title" className={PAGE_X}>
        <SectionTitle eyebrow="04 — Contact" title="Let's talk" />
        <ul className="m-0 mt-14 flex list-none flex-wrap gap-4 p-0">
          {ContactUtil.ALL.map((contact, index) => (
            <Reveal key={contact.name} as="li" delay={MotionUtil.delayFor(index)} className="max-md:w-full">
              <ContactLink contact={contact} />
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
