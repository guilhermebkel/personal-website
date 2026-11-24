import { CoverArtIcon } from "@components/Icons/CoverArtIcon.tsx";

type CoverProps = {
  className: string;
  seed: string;
};

export const Cover = ({ className, seed }: CoverProps) => {
  // Why: the height changes by place (a card 200px, a row 126px, the post 420px), so the caller sets it with a spacing class.
  // Why: the card around it zooms the cover on hover through the group name; reduced motion keeps it still.
  return (
    <div
      aria-hidden="true"
      className={`duration-zoom relative overflow-hidden bg-cover transition-transform group-hover/card:scale-[1.03] motion-reduce:transform-none ${className}`}
    >
      <CoverArtIcon seed={seed} />
    </div>
  );
};
