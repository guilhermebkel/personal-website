import Link from "next/link";
import { Button } from "@components/Button.tsx";
import { TraceMarkIcon } from "@components/Icons/TraceMarkIcon.tsx";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { Reveal } from "@components/Reveal.tsx";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

const TEXT_STEP = 2;
const ACTIONS_STEP = 4;

const NotFoundPage = () => {
  return (
    <div className={`pt-16 pb-28 ${PAGE_X}`}>
      <Reveal>
        <p className="m-0 font-mono text-small tracking-wide text-purple-light">404</p>
      </Reveal>
      <Reveal delay={MotionUtil.delayFor(1)}>
        <h1 className="m-0 mt-4 max-w-225 text-section font-medium tracking-title max-md:text-heading">
          Nothing here. I probably moved it.
        </h1>
      </Reveal>
      <Reveal delay={MotionUtil.delayFor(TEXT_STEP)}>
        <p className="m-0 mt-5 max-w-130 text-prose leading-7 text-text-soft">
          The page you were looking for does not exist, or it used to. Try the posts or start from the beginning.
        </p>
      </Reveal>
      <TraceMarkIcon className="mt-14 h-auto w-full max-w-300" />
      <Reveal delay={MotionUtil.delayFor(ACTIONS_STEP)} className="mt-12 flex flex-wrap gap-3">
        <Button asChild variant="primary">
          <Link href="/">
            Back home
            <Icon name="external" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/blog/">See posts</Link>
        </Button>
      </Reveal>
    </div>
  );
};

export default NotFoundPage;
