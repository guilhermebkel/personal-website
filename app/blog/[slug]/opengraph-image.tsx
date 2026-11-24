import { ImageResponse } from "next/og";
import { OgCard } from "@components/OgCard.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { OgImageUtil } from "@/Utils/OgImageUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

type PostOgImageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const size = OgImageUtil.SIZE;
export const contentType = "image/png";
export const alt = SiteUtil.NAME;

export const generateStaticParams = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

const PostOgImage = async ({ params }: PostOgImageProps) => {
  const { slug } = await params;
  const post = await ContentFactory.createPostService().readPost(slug);
  return new ImageResponse(<OgCard label="Post" title={post.title} />, {
    ...OgImageUtil.SIZE,
    fonts: await OgImageUtil.readFonts(),
  });
};

export default PostOgImage;
