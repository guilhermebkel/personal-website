type CoverProps = {
  className: string;
};

export const Cover = ({ className }: CoverProps) => {
  // Why: the height changes by place (a card 200px, a row 126px, the post 420px), so the caller sets it with a spacing class.
  // Why: there is no cover image in the content format yet, so the cover is a tonal block with the brand rings (prototype: terrain lines and a ring). The card around it zooms the rings on hover through the group name.
  return (
    <div aria-hidden="true" className={`relative overflow-hidden bg-cover ${className}`}>
      <div className="duration-zoom absolute top-1/2 left-1/2 size-16 -translate-1/2 rounded-full border-2 border-purple bg-purple-wash transition-transform group-hover/card:scale-110" />
      <div className="duration-zoom absolute top-1/2 left-1/2 size-32 -translate-1/2 rounded-full border-2 border-ring-cover transition-transform group-hover/card:scale-110" />
    </div>
  );
};
