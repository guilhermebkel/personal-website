import { ColorTokenUtil } from "@/Utils/ColorTokenUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

type OgCardProps = {
  label: string;
  title: string;
  description?: string;
};

const PADDING = 80;
const TITLE_SIZE = 84;
const LONG_TITLE_SIZE = 56;
// Why: a title over this length at 84 px takes more than the card's height; the smaller size keeps a 120-character title inside the frame.
const LONG_TITLE = 60;
const LABEL_SIZE = 28;
const DESCRIPTION_SIZE = 32;
const DOT_SIZE = 16;
const TITLE_WIDTH = 1040;

export const OgCard = ({ label, title, description }: OgCardProps) => {
  // Why: next/og draws the card to PNG, so every style is written inline: there is no CSS for the image to read.
  const ground = ColorTokenUtil.readColor("graphite");
  const text = ColorTokenUtil.readColor("text");
  const soft = ColorTokenUtil.readColor("text-soft");
  const accent = ColorTokenUtil.readColor("purple-light");
  const titleSize = title.length > LONG_TITLE ? LONG_TITLE_SIZE : TITLE_SIZE;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: PADDING,
        background: ground,
        color: text,
        fontFamily: "Ubuntu",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: LABEL_SIZE, color: soft }}>
        <div
          style={{ display: "flex", width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE, background: accent }}
        />
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: TITLE_WIDTH }}>
        <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.08 }}>{title}</div>
        {description === undefined ? null : (
          <div style={{ display: "flex", fontSize: DESCRIPTION_SIZE, lineHeight: 1.3, color: soft }}>{description}</div>
        )}
      </div>
      <div style={{ display: "flex", fontSize: LABEL_SIZE, color: soft }}>{SiteUtil.URL.replace("https://", "")}</div>
    </div>
  );
};
