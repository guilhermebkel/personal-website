export type Post = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  summary: string;
  tags: string[];
  cover?: string;
  readingMinutes: number;
  body: string;
};
