import { PostImage } from "@components/PostImage.tsx";

export const PostFigure = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => {
  // Why: a figure takes the width of the text column, the same as a code block, so it never reaches past the text.
  return (
    <figure className="m-0 mb-6 [&_img]:mb-0!">
      <PostImage src={src} alt={alt} />
      {caption === "" ? null : <figcaption>{caption}</figcaption>}
    </figure>
  );
};
