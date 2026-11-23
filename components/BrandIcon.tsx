import { GithubIcon } from "@components/Icons/GithubIcon.tsx";
import { LinkedinIcon } from "@components/Icons/LinkedinIcon.tsx";
import { MailIcon } from "@components/Icons/MailIcon.tsx";
import { WhatsappIcon } from "@components/Icons/WhatsappIcon.tsx";
import type { ContactName } from "@/Utils/ContactUtil.ts";

const NAME_TO_ICON = {
  whatsapp: WhatsappIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
  github: GithubIcon,
};

type BrandIconProps = {
  name: ContactName;
  className?: string;
};

export const BrandIcon = ({ name, className }: BrandIconProps) => {
  const Component = NAME_TO_ICON[name];
  return <Component className={className} />;
};
