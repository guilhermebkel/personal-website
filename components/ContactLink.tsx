import { BrandIcon } from "@components/BrandIcon.tsx";
import { Icon } from "@components/Icon.tsx";
import type { Contact } from "@/Utils/ContactUtil.ts";

// Why: the prototype's contact is a wide pill: brand icon, the name, and the arrow that says it leaves the site.
export const ContactLink = ({ contact }: { contact: Contact }) => {
  return (
    <a
      href={contact.href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group flex items-center gap-3.5 rounded-pill border-2 border-border-strong bg-control px-7 py-4.5 text-lead text-text no-underline",
        "transition-colors duration-250 md:hover:border-purple-light",
      ].join(" ")}
    >
      <BrandIcon name={contact.name} className="size-6" />
      <span className="flex-1">{contact.label}</span>
      <Icon name="external" className="size-4.5 text-text-soft transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
};
