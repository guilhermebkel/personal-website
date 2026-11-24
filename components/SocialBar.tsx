import { BrandIcon } from "@components/BrandIcon.tsx";
import { ContactUtil } from "@/Utils/ContactUtil.ts";

type SocialBarProps = {
  isBare?: boolean;
};

export const SocialBar = ({ isBare = false }: SocialBarProps) => {
  // Why: the hit area is 44 px on every breakpoint; the negative margin keeps the icon at its visual spacing.
  // Why: on the white mobile menu the icons have no pill and take the dark text color.
  const listClass = isBare
    ? "gap-5"
    : "gap-6 md:gap-7 rounded-pill border-2 border-line bg-graphite px-7 py-3 md:px-8 md:py-3.5";
  return (
    <ul className={`m-0 flex list-none items-center p-0 ${listClass}`}>
      {ContactUtil.ALL.map((contact) => (
        <li key={contact.name}>
          <a
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={contact.label}
            className="duration-quick -m-2.5 inline-flex size-11 items-center justify-center text-inherit transition-transform hover:-translate-y-0.5"
          >
            <BrandIcon name={contact.name} className="size-6" />
          </a>
        </li>
      ))}
    </ul>
  );
};
