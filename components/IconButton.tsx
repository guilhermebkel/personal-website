import type { ReactNode } from "react";
import { Icon, type IconName } from "@components/Icon.tsx";
import { Link } from "@components/Link.tsx";

type IconButtonProps = {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  isDisabled?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
};

const SIZE_AND_TOUCH = "size-6 max-md:size-11 max-md:py-0 max-md:-my-0 inline-flex items-center justify-center";
const ICON_SIZE = "size-6";

const renderIcon = (icon: IconName): ReactNode => <Icon name={icon} className={ICON_SIZE} />;

export const IconButton = (props: IconButtonProps) => {
  // Why: the icon is decorative (aria-hidden), so the label is its only name for a screen reader.
  const { icon, label, href, onClick, isDisabled = false, ariaExpanded, ariaControls } = props;
  if (href !== undefined) {
    return (
      <Link href={href} aria-label={label} hasExternalIcon={false} className={`${SIZE_AND_TOUCH} pr-0`}>
        {renderIcon(icon)}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      disabled={isDisabled}
      onClick={onClick}
      className={`${SIZE_AND_TOUCH} cursor-pointer border-0 bg-transparent p-0 text-inherit focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-40`}
    >
      {renderIcon(icon)}
    </button>
  );
};
