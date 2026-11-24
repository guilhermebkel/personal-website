import { PostImage } from "@components/PostImage.tsx";

export const PostFigure = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => {
  // Why: a figure is only widened on desktop, where the text column leaves room beside it; on a phone it stays at the column width so it cannot scroll sideways.
  return (
    <figure className="m-0 mb-6 xl:w-figure [&_img]:mb-0!">
      <PostImage src={src} alt={alt} />
      {caption === "" ? null : <figcaption>{caption}</figcaption>}
    </figure>
  );
};
