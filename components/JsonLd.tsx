type JsonLdProps = {
  data: Record<string, unknown>;
};

export const JsonLd = ({ data }: JsonLdProps) => {
  // Why: structured data is written as a JSON script that search engines read; it is not shown on the page.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
};
