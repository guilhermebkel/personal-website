export const PostSummaryBox = ({ summary }: { summary: string }) => (
  <aside className="mt-14 max-w-180 rounded-lg border-2 border-sunken bg-raised px-7 py-6">
    <p className="m-0 font-mono text-caption tracking-wide text-purple-light">SUMMARY</p>
    <p className="m-0 mt-3 text-lead text-text">{summary}</p>
  </aside>
);
