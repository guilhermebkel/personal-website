type TagProps = {
  label: string;
  // Why: a post tag is outlined; a project tag sits on a filled ground (prototype: chip2 and chip).
  variant?: "post" | "project";
};

const VARIANT_TO_CLASS = {
  post: "border-border-strong text-text-soft",
  project: "border-line bg-sunken text-text-soft",
};

export const Tag = ({ label, variant = "post" }: TagProps) => {
  return (
    <span className={`inline-flex rounded-pill border-2 px-3 py-1 text-caption ${VARIANT_TO_CLASS[variant]}`}>{label}</span>
  );
};
